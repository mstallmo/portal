fn main() {
    tonic_build::configure()
        .type_attribute(
            "DirTreeItem",
            "#[derive(serde::Serialize, serde::Deserialize)]",
        )
        .type_attribute("DirTree", "#[derive(serde::Serialize, serde::Deserialize)]")
        .compile_protos(&["proto/portal.proto"], &["."])
        .unwrap_or_else(|e| panic!("Failed to compile protos: {:?}", e));
}
