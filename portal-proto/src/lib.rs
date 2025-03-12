mod portal {
    tonic::include_proto!("portal");
}

pub mod client {
    pub use super::portal::portal_client::PortalClient;
}
pub mod server {
    pub use super::portal::portal_server::{Portal, PortalServer};
}

pub use portal::{DirTree, DirTreeItem, ListDirRequest};

impl DirTreeItem {
    pub fn is_dir(&self) -> bool {
        !self.children.is_empty()
    }
}
