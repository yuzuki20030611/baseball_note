import { MenuItemType } from "../../types/AddMenu";
import { CreateNoteRequest, UpdateNoteRequest } from "../../types/note";

export type NoteValidationErrors = {
  theme?: string;
  assignment?: string;
  practice_video?: string;
  my_video?: string;
  weight?: string;
  sleep?: string;
  looked_day?: string;
  practice?: string;
  trainings?: string;
};

export const isValidUrl = (url: string): boolean => {
  try {
    // URLの基本的な形式チェック
    const parsedUrl = new URL(url);
  
    // httpまたはhttpsのみ許可
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    // URL形式が不正な場合
    return false;
  }
};


export const validateNote = (data: CreateNoteRequest, availableTrainings: MenuItemType[]): NoteValidationErrors => {
  const errors: NoteValidationErrors = {};

  // 1日のテーマのバリデーション
  if (!data.theme || data.theme.trim() === "") {
    errors.theme = "1日のテーマは必須です";
  } else if (data.theme.length > 255) {
    errors.theme = "1日のテーマは255文字以内で入力してください";
  }

  // 課題のバリデーション
  if (!data.assignment || data.assignment.trim() === "") {
    errors.assignment = "課題は必須です";
  } else if (data.assignment.length > 255) {
    errors.assignment = "課題は255文字以内で入力してください";
  }


  // 練習動画のURLバリデーション
  // YouTubeと動画のみしか入力することができないように設定
  if (data.practice_video) {
    if (data.practice_video.length > 255) {
      errors.practice_video = "動画URLが長すぎます";
    } else if (!isValidUrl(data.practice_video)) {
      errors.practice_video = "有効な動画URLを入力してください";
    } else {
      const getYouTubeVideoId = (url: string): string | null => {
        const match = url.match(/^.*(youtu.be\/|v\/|watch\?v=|&v=)([^#&?]*).*/);
        return match && match[2].length === 11 ? match[2] : null;
      };
      const youTubeId = getYouTubeVideoId(data.practice_video);
      const isFileVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(data.practice_video);

      if (!youTubeId && !isFileVideo) {
        errors.practice_video = "YouTubeのURLまたは動画ファイル（.mp4/.webm/.ogg）のURLを入力してください";
      }
    }
  }

  // 体重のバリデーション
  if (data.weight <= 0) {
    errors.weight = "体重は0より大きい数字を入力してください";
  } else if (data.weight > 999.9) {
    errors.weight = "体重は999.9kg以下で入力してください";
  } else if (!Number.isInteger(data.weight * 10)) {
    // 小数点第1位までかチェック（小数点第2位以下がある場合はエラー）
    errors.weight = "体重は小数点第1位までで入力してください";
  }
  

  // 睡眠時間のバリデーション
  if (data.sleep <= 0) {
    errors.sleep = "睡眠時間は0より大きい数字を入力してください";
  } else if (data.sleep > 99.9) {
    errors.sleep = "睡眠時間は99.9時間以下で入力してください";
  } else if (!Number.isInteger(data.sleep * 10)) {
    // 小数点第1位までかチェック（小数点第2位以下がある場合はエラー）
    errors.sleep = "睡眠時間は小数点第1位までで入力してください";
  }

  // その他の練習のバリデーション
  if (data.practice && data.practice.length > 600) {
    errors.practice = "1日の振り返りは600文字以内で入力してください";
  }

  // 1日の振り返りのバリデーション
  if (!data.looked_day || data.looked_day.trim() === "") {
    errors.looked_day = "1日の振り返りは必須です";
  } else if (data.looked_day.length > 600) {
    errors.looked_day = "1日の振り返りは600文字以内で入力してください";
  }

  // 基礎トレーニングのバリデーション
  if (availableTrainings && availableTrainings.length > 0) {
    // 全てのトレーニングIDが含まれているか確認
    const allTrainingIds = availableTrainings.map(training => training.id);
    const enteredTrainingIds = data.trainings.map(t => t.training_id);
    
    // 全てのトレーニングが入力されているか
    const missingTrainings = allTrainingIds.some(id => !enteredTrainingIds.includes(id));
    
    if (missingTrainings) {
      errors.trainings = "すべてのトレーニングメニューに対して回数を入力してください";
      return errors;
    }
    
    // 全てのトレーニングが1回以上か
    const invalidTrainings = data.trainings.filter(t => t.count <= 0);
    if (invalidTrainings.length > 0) {
      errors.trainings = "トレーニングに対して1回以上の回数を入力してください";
    }
  }

  return errors;
};

/**
 * 動画ファイルのバリデーション
 * @param file バリデーション対象のファイル
 * @returns エラーメッセージ。問題なければundefined
 */
export const validateMyVideo = (file: File | null | undefined): string | undefined => {
  if (!file) return undefined;

  if (!(file instanceof File)) {
    return "有効なファイルオブジェクトではありません。";
  }

  // ファイルサイズのチェック（例: 50MB上限）
  if (file.size > 50 * 1024 * 1024) {
    return "動画のサイズは50MB以下にしてください";
  }

  // ファイル形式のチェック
  if (!file.type.startsWith("video/")) {
    return "動画ファイルを選択してください";
  }

  return undefined;
};



export const validateEditNote = (
  data: UpdateNoteRequest,
  availableTrainings: MenuItemType[]
): NoteValidationErrors => {
  const errors: NoteValidationErrors = {};

  // 1日のテーマのバリデーション
  if (!data.theme || data.theme.trim() === "") {
    errors.theme = "1日のテーマは必須です";
  } else if (data.theme.length > 255) {
    errors.theme = "1日のテーマは255文字以内で入力してください";
  }

  // 課題のバリデーション
  if (!data.assignment || data.assignment.trim() === "") {
    errors.assignment = "課題は必須です";
  } else if (data.assignment.length > 255) {
    errors.assignment = "課題は255文字以内で入力してください";
  }

  // 練習動画のURLバリデーション
  if (data.practice_video) {
    if (data.practice_video.length > 255) {
      errors.practice_video = "動画URLが長すぎます";
    } else if (!isValidUrl(data.practice_video)) {
      errors.practice_video = "有効な動画URLを入力してください";
    } else {
      // ここでYouTubeの形式か動画の形式でない場合はデータベースに保存することができない
      const getYouTubeVideoId = (url: string): string | null => {
        const match = url.match(/^.*(youtu.be\/|v\/|watch\?v=|&v=)([^#&?]*).*/);
        return match && match[2].length === 11 ? match[2] : null;
      };
      const youTubeId = getYouTubeVideoId(data.practice_video);
      const isFileVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(data.practice_video);

      if (!youTubeId && !isFileVideo) {
        errors.practice_video = "YouTubeのURLまたは動画ファイル（.mp4/.webm/.ogg）のURLを入力してください";
      }
    }
  }

  // 体重のバリデーション
  const weight = typeof data.weight === 'string' ? parseFloat(data.weight) : data.weight;
  if (weight <= 0) {
    errors.weight = "体重は0より大きい数字を入力してください";
  } else if (weight > 999.9) {
    errors.weight = "体重は999.9kg以下で入力してください";
  } else if (!Number.isInteger(weight * 10)) {
    // 小数点第1位までかチェック（小数点第2位以下がある場合はエラー）
    errors.weight = "体重は小数点第1位までで入力してください";
  }

  // 睡眠時間のバリデーション
  const sleep = typeof data.sleep === 'string' ? parseFloat(data.sleep) : data.sleep;
  if (sleep <= 0) {
    errors.sleep = "睡眠時間は0より大きい数字を入力してください";
  } else if (sleep > 99.9) {
    errors.sleep = "睡眠時間は99.9時間以下で入力してください";
  } else if (!Number.isInteger(sleep * 10)) {
    // 小数点第1位までかチェック（小数点第2位以下がある場合はエラー）
    errors.sleep = "睡眠時間は小数点第1位までで入力してください";
  }

  // その他の練習のバリデーション
  if (data.practice && data.practice.length > 600) {
    errors.practice = "1日の振り返りは600文字以内で入力してください";
  }

  // 1日の振り返りのバリデーション
  if (!data.looked_day || data.looked_day.trim() === "") {
    errors.looked_day = "1日の振り返りは必須です";
  } else if (data.looked_day.length > 600) {
    errors.looked_day = "1日の振り返りは600文字以内で入力してください";
  }

  // 基礎トレーニングのバリデーション
  if (availableTrainings && availableTrainings.length > 0) {
    // 全てのトレーニングIDが含まれているか確認
    const allTrainingIds = availableTrainings.map(training => training.id);
    const enteredTrainingIds = data.trainings.map(t => t.training_id);
    
    // 全てのトレーニングが入力されているか
    const missingTrainings = allTrainingIds.some(id => !enteredTrainingIds.includes(id));
    
    if (missingTrainings) {
      errors.trainings = "すべてのトレーニングメニューに対して必要な情報を入力してください";
      return errors;
    }
    
    // 全てのトレーニングが1回以上か
    const invalidTrainings = data.trainings.filter(t => t.count <= 0);
    if (invalidTrainings.length > 0) {
      errors.trainings = "トレーニングに対して1回以上の回数を入力してください";
    }
  }

  return errors;
};