import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    verifyBeforeUpdateEmail,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth"; // 型のみインポート

import { AccountRole } from "../../types/account"
import { auth } from "../firebase/config";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


// Firebaseでユーザーを作成し、バックエンドにも登録
export const createAccount = async(
    email: string,
    password: string,
    role: AccountRole,
): Promise<UserCredential> => {
    try {
        // 1. Firebaseでユーザーを作成
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user

        const response = await fetch(`${API_URL}/auth/users`, {//エンドポイントauthファイルのusersのパス
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firebase_uid: user.uid,
                email: user.email,
                role: typeof role === 'string' ? parseInt(role, 10) : role,
            }),
        });


        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "バックエンドへのユーザー登録に失敗しました.")
        }

        return userCredential;
    }catch (error: any) {
        console.error("Firebase アカウント作成エラー:", error);
        // エラーメッセージをユーザーフレンドリーにする
        if (error.code === 'auth/email-already-in-use') {
            throw new Error("このメールアドレスは既に使用されています。別のメールアドレスを使用するか、ログインしてください。");
        } else if (error.code === 'auth/weak-password') {
            throw new Error("パスワードが弱すぎます。より強力なパスワードを設定してください。");
        } else {
            throw error; // その他のエラーはそのまま上位に伝播
        }
    }
}


// ログインしてからログインした者の役割の情報をとってくる
export const loginWithRoleCheck = async (
    email: string,
    password: string
): Promise<{ user: UserCredential; role: AccountRole | undefined }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        const role = await fetchUserRole(userCredential.user.uid)

        return { user: userCredential, role}
    } catch(error) {
        console.error("ログインエラー", error)
        throw error
    }
}

// ログアウト
export const logout = async(): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Firebase ログアウトエラー:", error)
        throw error
    }
};

// パスワードリセットメールの送信
export const resetPassword = async(email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email)
    } catch (error) {
        console.error("パスワードリセットエラー", error)
        throw error
    }
}



// バックエンドからユーザーロールを取得
export const fetchUserRole = async (firebaseUid: string): Promise<AccountRole | undefined> => {
    const apiUrl = `${API_URL}/auth/users/firebase/${firebaseUid}/role`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error('ユーザーロール取得に失敗しました');
        }

        const data = await response.json();
        return data.role;
    } catch (error) {
        console.error('ロール取得エラー詳細:', error);
        return undefined;
    }
};



export const updateUserPassword = async(currentPassword: string, newPassword: string): Promise<void> => {
    try {
        const user = auth.currentUser
        if(!user || !user.email) {
            throw new Error("ログインしていないか、メールアドレスが取得できません。")
        }

        // 認証情報の再確認
        const credential = EmailAuthProvider.credential(user.email, currentPassword)

        // 再認証
        await reauthenticateWithCredential(user, credential)

        // パスワードの更新
        await updatePassword(user, newPassword)
    } catch (error: any) {
        console.error("パスワード更新エラー:", error)
        if(error.code === "auth/requires-recent-login") {
            throw new Error("セキュリティ上の理由により、再度ログインが必要です")
        } else if (error.code === "auth/weak-password") {
            throw new Error("パスワードが弱すぎます。より強力なパスワードを設定してください。")
        } else if (error.code === 'auth/invalid-credential') {
            throw new Error("現在のパスワードが正しくありません");
          } else {
            throw error;
          }
    }
}

export const updateUserEmail = async (
  currentPassword: string,
  newEmail: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("ログインしていないか、メールアドレスが取得できません。");
    }

    // 現在のメールアドレスを同じ場合はエラー
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
        alert("現在のメールアドレスと同じです。別のメールアドレスを入力してください。")
        throw new Error("現在のメールアドレスと同じです。別のメールアドレスを入力してください。")
    }

    // バックエンドでメールアドレスの重複チェック
    try {
        const response = await fetch(`${API_URL}/auth/users/email-exists`, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
            },
            body: JSON.stringify({ email: newEmail }),
        })
        const data = await response.json()

        if (data.exists) {
            alert("このメールアドレスは既に使用されています。別のメールアドレスを入力してください。")
            throw new Error("このメールアドレスは既に使用されています。別のメールアドレスを入力してください。")
        }
    } catch(error: any) {
        // バックエンドでのチェックに失敗した場合、エラーをスローせずに続行
      // Firebase側でも同様のチェックが行われるため
      if (error.message.includes("既に使用されています")) {
        throw error; // 明示的に「既に使用されている」エラーは出す
      }
      console.warn("バックエンドでのメールアドレスチェックに失敗しました:", error);
    }
    
    // 1. 再認証
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // 2. メール変更情報をローカルストレージに保存（AuthContext側で使用）
    // 取り出すときにparseが必要です
    localStorage.setItem('pendingEmailChange', JSON.stringify({
      firebaseUid: user.uid,
      newEmail: newEmail,
      timestamp: Date.now(),
    }));

    // 3. Firebase側のメールアドレス更新前の確認メールを送信
    await verifyBeforeUpdateEmail(user, newEmail);
    
    // 4. 成功メッセージをユーザーに表示
    alert(`
      新しいメールアドレス（${newEmail}）宛に確認メールを送信しました。
      メール内のリンクをクリックして変更を完了してください。
      変更完了後、自動的にシステムに反映されます。
    `);

    return;
  } catch (error: any) {
    console.error("メールアドレス更新エラー:", error);
    
    // エラーコードによる適切なメッセージ表示
    if (error.code === "auth/requires-recent-login") {
      throw new Error("セキュリティのため再度ログインが必要です。ログアウトして再度ログインしてください。");
    } else if (error.code === "auth/email-already-in-use") {
      throw new Error("このメールアドレスは既に使用されています。");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("メールアドレスの形式が正しくありません。");
    } else if (error.code === "auth/invalid-credential") {
      throw new Error("現在のパスワードが正しくありません。");
    } else if (error.code === "auth/operation-not-allowed") {
      throw new Error("この操作は現在許可されていません。しばらく経ってから再度お試しください。");
    } else {
      throw new Error(`メールアドレスの更新に失敗しました: ${error.message || "不明なエラー"}`);
    }
  }
};