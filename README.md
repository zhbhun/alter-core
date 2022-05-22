# facemoji-core

Contains the base Facemoji SDK that has two main features - face tracking and avatar rendering. See [facemoji-core-samples](https://github.com/facemoji/facemoji-core-samples.git) for example usage of this API.

## SwiftPackage Installation
Add this repository as a dependency to your Package.swift or XCode Project. You will need to authenticate with a [Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) to properly download packages from this repository.

## Manual iOS Installation
Download the FacemojiCore.xcframework file from this repository and drag&drop it into your XCode Project.

## Gradle/Maven Installation for Android
Add this repository to your Gradle repositories in build.gradle:
```
repositories {
    // ...
    maven {
        name = "GitHubPackages"
        url = "https://maven.pkg.github.com/facemoji/facemoji-core-releases"
        credentials {
            username = "YOUR_GITHUB_USERNAME"
            password = "YOUR_GITHUB_TOKEN"
        }
    }
    // ...
}

// ...
dependencies {
    implementation "co.facemoji:facemoji-core:${version}"
}
```

Replace YOUR_GITHUB_USERNAME and YOUR_GITHUB_TOKEN with your Github username and [Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) respectivelly to allow Gradle to download artifacts from this repository.

## Manual Android Installation
Open the newest Maven package in this repository and download the facemoji-core-${version}.aar file. Add the downloaded file as your local Gradle dependency in build.gradle.