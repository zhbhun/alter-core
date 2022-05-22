// swift-tools-version:5.3
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "facemoji-core",
    platforms: [
            .iOS(.v13)
//          .macOS(.v10_14), 
    ],
    products: [
        .library(
            name: "facemoji-core",
            targets: ["facemoji-core"]),
    ],
    dependencies: [
    ],
    targets: [
        .binaryTarget(
                    name: "facemoji-core",
                    path: "FacemojiCore.xcframework"
                )
    ]
)
