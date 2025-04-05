import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
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

        // 3. バックエンドにユーザー情報を保存

        const requestBody = {
            firebase_uid: user.uid,
            email: user.email,
            role: role,
        };
        console.log("バックエンドへのリクエスト:", `${API_URL}/auth/users`, requestBody);


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

        console.log("バックエンドレスポンス:", response.status);

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

// Firebaseでログイン
export const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
        return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Firebase ログインエラー：", error);
        throw error
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


export const registerUserInBackend = async(
    uid: string,
    email: string,
    role: AccountRole
): Promise<void> => {
    try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firebase_uid: uid,
                email,
                account_role: role,
            }),
        });
        if(!response.ok) {
            throw new Error("バックエンドでのユーザー登録に失敗しました。")
        }
    } catch(error) {
        console.error("バックエンド連携エラー:", error);
        // Firebaseには登録されているが、バックエンドに登録失敗した場合の対応
        // こちらは要件に応じて調整
        throw new Error('アカウント作成は完了しましたが、プロフィール情報の登録に失敗しました');
    }
}

// バックエンドからユーザーロールを取得
export const fetchUserRole = async (firebaseUid: string): Promise<AccountRole | undefined> => {
    const apiUrl = `${API_URL}/auth/users/firebase/${firebaseUid}/role`;
    console.log("完全なURL:", apiUrl);
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("API_URL:", API_URL);  // auth.tsの場合

    try {
        console.log("Making request to:", apiUrl);
        const response = await fetch(apiUrl);
        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error('ユーザーロール取得に失敗しました');
        }

        const data = await response.json();
        console.log("Role data:", data);
        return data.role;
    } catch (error) {
        console.error('ロール取得エラー詳細:', error);
        return undefined;
    }
};