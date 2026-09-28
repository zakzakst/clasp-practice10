const UPLOAD_FOLDER_ID = process.env.UPLOAD_FOLDER_ID!;

/**
 * HTMLテンプレートから別HTMLファイルの中身を取り込む（styles/app 用）。
 * @param filename HTMLファイル名
 * @returns ファイルの中身
 */
const include = (filename: string): string => {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
};

const doGet = (): GoogleAppsScript.HTML.HtmlOutput => {
  return HtmlService.createTemplateFromFile("page").evaluate();
};

type ImageUpload = {
  name: string;
  mimeType: string;
  data: string;
};

const uploadImage = (image: ImageUpload): string => {
  if (!image.mimeType.startsWith("image/") || !image.data) {
    throw new Error("画像ファイルを選択してください。");
  }

  const uploadFolder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMddHHmm",
  );
  const datedFolder = uploadFolder.createFolder(timestamp);
  const imageBlob = Utilities.newBlob(
    Utilities.base64Decode(image.data),
    image.mimeType,
    image.name,
  );

  datedFolder.createFile(imageBlob);
  return timestamp;
};
