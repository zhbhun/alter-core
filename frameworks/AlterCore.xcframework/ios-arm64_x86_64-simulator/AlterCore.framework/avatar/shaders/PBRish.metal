#include <fragment.defines>

#ifdef INST_COLOR
#include <blendingFunctionsHalf.metal>
#endif

#ifdef ENVIRONMENT_TEXTURE
float2 mapToAzimuthZenith(float3 vector) {
    //vector = normalize(vector);
    float z = acos(vector.y) / M_PI_F;
    float a = acos(normalize(vector.xz).y) / 2. / M_PI_F;
    if (vector.x < 0.0) a = 0.5 - a;
        else a = 0.5 + a;
    return float2(a, z);
}
#endif

#ifdef NORMAL_TEXTURE
float3x3 getTBN(float3 pos, float2 texCoord, float3 normal) {
    float3 Q1 = dfdx(pos);
    float3 Q2 = dfdy(pos);
    float2 st1 = dfdx(texCoord);
    float2 st2 = dfdy(texCoord);
    float3 b = normalize(-Q1 * st2.x + Q2 * st1.x);
    float3 t = normalize(cross(b, normal));
    b = cross(normal, t);
    return float3x3(t, b, normal); // "x/red right, y/green up" maps
}
#endif


struct FragmentUniforms {
    #ifndef COLOR_TEXTURE
        float4 color;
    #endif
    #ifndef PACKEDRMT_TEXTURE
        float4 packedRMT;
    #endif
    float brightness;
    #ifdef ENVIRONMENT_TEXTURE
        float mipLevels;
    #endif
    float3 lightViewPos;
    float4 lightColor;
    float4 ambientColor;
};

struct FragmentOut {
    half4 fragmentColor [[ color(0) ]];
};

fragment FragmentOut fragmentMain(
    Interpolate interpolate [[ stage_in ]],
    constant FragmentUniforms& uniforms [[ buffer(0) ]]

    #ifdef COLOR_TEXTURE
        ,texture2d<half> colorTexture,
        sampler colorTextureSampler
    #endif
    #ifdef PACKEDRMT_TEXTURE
        ,texture2d<half> packedRMTTexture,
        sampler packedRMTTextureSampler
    #endif
    #ifdef ENVIRONMENT_TEXTURE
        ,texture2d<half> environmentTexture,
        sampler environmentTextureSampler
    #endif
    #ifdef NORMAL_TEXTURE
        ,texture2d<float> normalTexture,
        sampler normalTextureSampler
    #endif
) {
    FragmentOut result;

    #ifdef COLOR_TEXTURE
    half4 color =  colorTexture.sample(colorTextureSampler, interpolate.colorCoord);
    #ifdef COLOR_TEXTURE_INVERT
    color = 1.0h - color;
    #endif
    #else
    half4 color = half4(uniforms.color);
    #endif

    #ifdef PACKEDRMT_TEXTURE
    half4 packedRMT =  packedRMTTexture.sample(packedRMTTextureSampler, interpolate.colorCoord);
    #ifdef PACKEDRMT_TEXTURE_INVERT
    packedRMT = half4(1.0h) - packedRMT;
    #endif
    #else
    half4 packedRMT = half4(uniforms.packedRMT);
    #endif

    half3 col = color.rgb * (1.0h + half(uniforms.brightness));

    half roughness = packedRMT.r;
    half metalness = packedRMT.g;

    half alpha = 1.0h;
    #ifdef TRANSPARENCY
    alpha = 1.0h - packedRMT.b;
    #endif

    #ifdef INST_COLOR
    #ifdef TRANSPARENCY
    half4 instCol = half4(uniforms.instColor.rgb, 1.0h);
    alpha = min(alpha, uniforms.instColor.a);
    #else
    half4 instCol = uniforms.instColor;
    #endif
    col = INST_COLOR_BLEND(half4(col, 1.0h), instCol).rgb;
    #endif

    half rough = 0.1h + 0.85h * clamp(roughness, 0.0h, 1.0h);
    rough = rough * rough;
    half shine = 1.0h - rough;

    float3 viewVec = normalize(-interpolate.viewPos);

    float3 lightVec = normalize(uniforms.lightViewPos - interpolate.viewPos);

    float3 normal = normalize(interpolate.viewNorm);
    #ifdef DOUBLE_SIDED
    if (normal.z < 0.0) normal = -normal;
    #endif
    #ifdef NORMAL_TEXTURE
    float3x3 tbn = getTBN(interpolate.viewPos, interpolate.colorCoord, normal);
    normal = tbn * normalize(normalTexture.sample(normalTextureSampler, interpolate.colorCoord).xyz * 2.0 - 1.0);
    #endif

    half nDv = max(0.0h, half(dot(viewVec, normal)));

    half reflectance = 0.04h;
    reflectance = reflectance + (1.0h - reflectance) * shine * shine;
    reflectance = reflectance + (1.0h - reflectance) * pow(1.0h - nDv, 5.0h);
    reflectance = reflectance + (1.0h - reflectance) * metalness;

    half nDl = max(0.0h, half(dot(lightVec, normal)));

    float3 h = normalize(lightVec + viewVec);
    half nDh = max(0.0h, half(dot(h, normal)));
    half nDh2 = nDh * nDh;
    half r2 = rough * rough;
    half denom = nDh2 * (r2 - 1.0h) + 1.0h;
    denom = denom * denom * 5.0h;

    half3 lightCol = half3(uniforms.lightColor.rgb);
    half3 diffuseLight = lightCol * nDl;
    half specularCoef = pow(nDh, 1.0h + 60.0h * shine);
    half3 specular = lightCol * reflectance * specularCoef * min(1.0h, r2 / denom);
    half maxCol = max(col.r, max(col.g, col.b));
    maxCol = max(maxCol, 0.001h);
    half3 metalicSpecular = (specular * 3.0h * pow(1.0h - roughness, 3.0h) + specularCoef * lightCol) * pow(col / maxCol, half3(3.0h));

    half metalicDiffuseDampen = 0.3h;
    
    half3 ambientCol = half3(uniforms.ambientColor.rgb);

    #ifdef ENVIRONMENT_TEXTURE
    metalicDiffuseDampen += 0.2h * (1.0h - roughness);

    half3 diffLight = ambientCol + (1.0h - ambientCol) * pow(environmentTexture.sample(environmentTextureSampler, mapToAzimuthZenith(normal), level(0.6 * uniforms.mipLevels)).xyz, half3(0.5h));
    half3 diff = col * diffLight;
    diffuseLight = 0.5h * (diffuseLight + diff);

    float3 reflectVec = reflect(-viewVec, normal);
    float2 azimutZenith = mapToAzimuthZenith(reflectVec);
    float2 minLodXY = log2(0.5 * (abs(dfdx(azimutZenith)) + abs(dfdy(azimutZenith))) * float2(environmentTexture.get_width(), environmentTexture.get_height()));
    float minLod = 0.5 * (minLodXY.x + minLodXY.y);
    half3 refcolor = environmentTexture.sample(environmentTextureSampler, azimutZenith, level(max(float(sqrt(roughness)) * 0.65 * uniforms.mipLevels, minLod))).xyz;
    half3 spec = pow(refcolor, half3(1.h + 2.h * (1.h - metalness) * (1.0h - roughness)))  * reflectance;
    specular += (1.0h - specular) * spec;
    metalicSpecular += (spec + 2.0h * pow(spec, half3(3.0h)) * pow(1.0h - roughness, 3.0h)) * pow(col / maxCol, half3(3.0h));
    #endif

    half3 diffuse = col * (ambientCol + (1.0h - ambientCol) * diffuseLight) * (1.0h - metalicDiffuseDampen * metalness);

    half metal = sqrt(metalness);
    half3 dielectric = (1.0h - diffuse) * specular;
    half3 metalic = (1.0h - max(max(diffuse.r, diffuse.g), diffuse.b)) * metalicSpecular;
    half3 finalSpecular = dielectric * (1.0h - metal) + metalic * metal;
    half3 finalColor = diffuse + finalSpecular;

    result.fragmentColor = half4(finalColor, alpha);

    return result;
}
