#include <fragment.defines>

struct FragmentUniforms {
    #ifndef COLOR_TEXTURE
        float4 color;
    #endif
    #ifdef TRANSPARENCY
        #ifndef TRANSPARENCY_TEXTURE
            float transparency;
        #endif
    #endif
    float brightness;
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

    #ifdef TRANSPARENCY_TEXTURE
        ,texture2d<half> transparencyTexture,
        sampler transparencyTextureSampler
    #endif
) {
    FragmentOut result;

    #ifdef COLOR_TEXTURE
    half4 color =  colorTexture.sample(colorTextureSampler, interpolate.colorCoord);
    #else
    half4 color = half4(uniforms.color);
    #endif

    #ifdef TRANSPARENCY
        #ifdef TRANSPARENCY_TEXTURE
        half transparency = transparencyTexture.sample(transparencyTextureSampler, interpolate.colorCoord).r;
        #else
        half transparency = half(uniforms.transparency);
        #endif
    #endif

    half3 col = color.rgb * (1.0 + half(uniforms.brightness));

    half alpha = 1.0;
    #ifdef TRANSPARENCY
    alpha = 1.0 - transparency;
    #endif

    result.fragmentColor = half4(col.rgb, alpha);
    return result;
}
