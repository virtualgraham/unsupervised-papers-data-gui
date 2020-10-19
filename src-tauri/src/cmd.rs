extern crate image;

use image::imageops::{overlay, resize, FilterType};
use image::{ImageBuffer, DynamicImage, Pixel, Rgb};
use std::fs::File;

use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
  // your custom commands
  // multiple arguments are allowed
  // note that rename_all = "camelCase": you need to use "myCustomCommand" on JS
  ProcessThumbnail { 
    src: String, 
    dest: String, 
    width: u32, 
    height: u32, 
    fill:bool 
  },
}

pub fn process_thumbnail(src:&str, dest:&str, width:u32, height:u32, fill:bool) -> Result<(), std::io::Error>{
  let img = image::open(src).unwrap().into_rgb();

  let dim = img.dimensions();

  let mut img = if (dim.0 as f32)/(dim.1 as f32) > (width as f32)/(height as f32) { 
      resize(&img, width, ((width as f32)/(dim.0 as f32) * (dim.1 as f32)).round() as u32, FilterType::Lanczos3) 
  } else { 
      resize(&img, ((height as f32)/(dim.1 as f32) * (dim.0 as f32)).round() as u32, height, FilterType::Lanczos3) 
  };

  let img_bg = if fill {
      let dim = img.dimensions();
      let x = ((width as f32)/2.0 - (dim.0 as f32)/2.0).round() as u32;
      let y = ((height as f32)/2.0 - (dim.1 as f32)/2.0).round() as u32;
      let mut bg = ImageBuffer::from_pixel(width, height, Rgb::from_channels(255u8,255u8,255u8,0u8));
      overlay(&mut bg, &mut img, x, y);
      bg
  } else {
      img
  };

  let mut buffer = File::create(dest)?;

  DynamicImage::ImageRgb8(img_bg).write_to(&mut buffer, image::ImageOutputFormat::Jpeg(70u8)).unwrap();

  Ok(())
}