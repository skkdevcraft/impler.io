import * as XLSX from 'xlsx';
import { Defaults, FileEncodingsEnum, IFileInformation } from '@impler/shared';
import { ParseConfig, parse } from 'papaparse';
import { ParserOptionsArgs, parseString } from 'fast-csv';
import { EmptyFileException } from '@shared/exceptions/empty-file.exception';
import { APIMessages } from '@shared/constants';
import { InvalidFileException } from '@shared/exceptions/invalid-file.exception';

export abstract class FileService {
  abstract getFileInformation(file: Express.Multer.File, options?: ParserOptionsArgs): Promise<IFileInformation>;
}

export class CSVFileService extends FileService {
  async getFileInformation(file: string | Express.Multer.File, options?: ParserOptionsArgs): Promise<IFileInformation> {
    return new Promise((resolve, reject) => {
      const information: IFileInformation = {
        data: [],
        headings: [],
        totalRecords: 0,
      };
      let fileContent: string;
      if (typeof file === 'string') {
        fileContent = file;
      } else {
        fileContent = file.buffer.toString(FileEncodingsEnum.CSV);
      }

      parseString(fileContent, {
        ...options,
        headers: (headers) => {
          // rename duplicate
          headers.map((el, i, ar) => {
            if (ar.indexOf(el) !== i) {
              headers[i] = `${el}_${i}`;
            }
          });

          return headers;
        },
      })
        .on('error', (error) => {
          if (error.message.includes('Parse Error')) {
            reject(new InvalidFileException());
          } else {
            reject(error);
          }
        })
        .on('headers', (headers) => information.headings.push(...headers))
        .on('data', () => information.totalRecords++)
        .on('end', () => {
          if (!information.totalRecords) return reject(new EmptyFileException());
          resolve(information);
        });
    });
  }
}
export class ExcelFileService extends FileService {
  async getFileInformation(file: Express.Multer.File): Promise<IFileInformation> {
    const fileContent = file.buffer.toString(FileEncodingsEnum.EXCEL);
    const workbookHeaders = XLSX.read(fileContent);
    // Throw empty error if file do not have any sheets
    if (workbookHeaders.SheetNames.length < Defaults.ONE) throw new EmptyFileException();

    // get file headings
    const headings = XLSX.utils.sheet_to_json(workbookHeaders.Sheets[workbookHeaders.SheetNames[Defaults.ZERO]], {
      header: 1,
    })[Defaults.ZERO] as string[];
    // throw error if sheet is empty
    if (!headings || headings.length < Defaults.ONE) throw new EmptyFileException();

    // Refine headings by replacing empty heading
    let emptyHeadingCount = 0;
    const updatedHeading = [];
    for (const headingItem of headings) {
      if (!headingItem) {
        emptyHeadingCount += Defaults.ONE;
        updatedHeading.push(`${APIMessages.EMPTY_HEADING_PREFIX} ${emptyHeadingCount}`);
      } else updatedHeading.push(headingItem);
    }

    const data: Record<string, unknown>[] = XLSX.utils.sheet_to_json(
      workbookHeaders.Sheets[workbookHeaders.SheetNames[Defaults.ZERO]]
    );

    return {
      data,
      headings: updatedHeading,
      totalRecords: data.length,
    };
  }
  convertToCsv(file: Express.Multer.File): string {
    const fileContent = file.buffer.toString(FileEncodingsEnum.EXCEL);
    const workbookHeaders = XLSX.read(fileContent);
    const sheet = workbookHeaders.Sheets[workbookHeaders.SheetNames[Defaults.ZERO]];

    return XLSX.utils.sheet_to_csv(sheet, {
      blankrows: false,
      FS: ',',
      RS: '\n',
      strip: true,
    });
  }
  renameJSONHeaders(jsonData: any[], headings: string[]): Record<string, unknown>[] {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(jsonData);
    XLSX.utils.sheet_add_aoa(ws, [headings]);
    XLSX.utils.book_append_sheet(wb, ws);

    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[Defaults.ZERO]]);
  }
}

export class CSVFileService2 {
  getFileHeaders(file: string | Express.Multer.File, options?: ParseConfig): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let fileContent = '';
      if (typeof file === 'string') {
        fileContent = file;
      } else {
        fileContent = file.buffer.toString(FileEncodingsEnum.CSV);
      }
      parse(fileContent, {
        ...(options || {}),
        preview: 1,
        step: (results) => {
          if (Object.keys(results.data).length > Defaults.ONE) {
            resolve(results.data);
          } else {
            reject(new EmptyFileException());
          }
        },
        error: (error) => {
          if (error.message.includes('Parse Error')) {
            reject(new InvalidFileException());
          } else {
            reject(error);
          }
        },
      });
    });
  }
}
