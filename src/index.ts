const UPLOAD_FOLDER_ID = process.env.UPLOAD_FOLDER_ID!;

type UploadRequest = {
  imageBase64?: string;
  fileName?: string;
  mimeType?: string;
};

type UploadResponse = {
  success: boolean;
  folderId?: string;
  fileId?: string;
  fileName?: string;
  error?: string;
};

/**
 * JSONで受け取った画像を、設定済みの親フォルダ内に日時フォルダを作成して保存する。
 * リクエスト: { imageBase64, fileName?, mimeType? }
 * 親フォルダIDはScript PropertiesのUPLOAD_FOLDER_IDに設定する。
 */
function doPost(
  e: GoogleAppsScript.Events.DoPost,
): GoogleAppsScript.Content.TextOutput {
  try {
    const uploadFolderId =
      PropertiesService.getScriptProperties().getProperty(UPLOAD_FOLDER_ID);
    if (!uploadFolderId) {
      throw new Error("UPLOAD_FOLDER_ID is not configured.");
    }

    const request = JSON.parse(e.postData.contents) as UploadRequest;
    if (!request.imageBase64) {
      throw new Error("imageBase64 is required.");
    }

    const mimeType = request.mimeType || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      throw new Error("mimeType must be an image type.");
    }

    const base64 = request.imageBase64.replace(
      /^data:image\/[^;]+;base64,/,
      "",
    );
    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      mimeType,
      request.fileName || "upload",
    );
    const parentFolder = DriveApp.getFolderById(uploadFolderId);
    const folderName = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyyMMddHHmm",
    );
    const uploadFolder = parentFolder.createFolder(folderName);
    const file = uploadFolder.createFile(imageBlob);

    return createJsonResponse_({
      success: true,
      folderId: uploadFolder.getId(),
      fileId: file.getId(),
      fileName: file.getName(),
    });
  } catch (error) {
    return createJsonResponse_({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const createJsonResponse_ = (
  response: UploadResponse,
): GoogleAppsScript.Content.TextOutput => {
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(
    ContentService.MimeType.JSON,
  );
};
