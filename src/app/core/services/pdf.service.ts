import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PdfService {
  // Dynamic import avoids esbuild's "Cannot assign to import" restriction on CJS modules
  private async getPdfMake(): Promise<any> {
    const [pdfMakeModule, pdfFontsModule] = await Promise.all([
      import('pdfmake/build/pdfmake'),
      import('pdfmake/build/vfs_fonts'),
    ]);
    const pdfMake = pdfMakeModule as any;
    pdfMake.vfs = (pdfFontsModule as any).pdfMake?.vfs;
    return pdfMake;
  }

  async download(docDefinition: object, filename: string): Promise<void> {
    const pdfMake = await this.getPdfMake();
    pdfMake.createPdf(docDefinition).download(filename);
  }
}
