// profile/helpers/cropHelpers.ts
export type CropPixels = {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  export async function getCroppedDataUrlWeb(
    imageSrc: string,
    cropAreaPixels: CropPixels
  ): Promise<string> {
    const doc = (globalThis as any).document;
    const win = (globalThis as any).window;
  
    if (!doc || !win) throw new Error("Not running in a web environment.");
  
    return new Promise<string>((resolve, reject) => {
      const img = new win.Image() as HTMLImageElement;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = doc.createElement("canvas") as HTMLCanvasElement;
        canvas.width = cropAreaPixels.width;
        canvas.height = cropAreaPixels.height;
  
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
  
        ctx.drawImage(
          img,
          cropAreaPixels.x,
          cropAreaPixels.y,
          cropAreaPixels.width,
          cropAreaPixels.height,
          0,
          0,
          cropAreaPixels.width,
          cropAreaPixels.height
        );
  
        // Resize to a 512×512 square
        const out = doc.createElement("canvas") as HTMLCanvasElement;
        out.width = out.height = 512;
        const octx = out.getContext("2d");
        if (!octx) return reject(new Error("Canvas not supported"));
        octx.drawImage(canvas, 0, 0, 512, 512);
  
        resolve(out.toDataURL("image/jpeg", 0.9));
      };
  
      img.onerror = reject;
      img.src = imageSrc;
    });
  }
  