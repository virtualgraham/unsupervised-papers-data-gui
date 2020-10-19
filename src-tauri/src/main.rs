#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod cmd;

use cmd::process_thumbnail;

fn main() {
  tauri::AppBuilder::new()
    .invoke_handler(|_webview, arg| {
      use cmd::Cmd::*;
      match serde_json::from_str(arg) {
        Err(e) => {
          Err(e.to_string())
        }
        Ok(command) => {
          match command {
            // definitions for your custom commands from Cmd here
            ProcessThumbnail{ src, dest, width, height, fill } => {
              //  your command code
              match process_thumbnail(&src, &dest, width, height, fill) {
                Err(e) => Err(e.to_string()),
                Ok(()) => Ok(())
              }
            }
          }
        }
      }
    })
    .build()
    .run();
}
