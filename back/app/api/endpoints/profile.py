from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import datetime, date
from app.core.database import get_async_db
from app.crud import profile as profile_crud
from app.schemas.profile import (
    CreateProfile,
    ResponseProfile,
    UpdateProfile,
    ResponseProfileList,
)
from app.core.logger import get_logger
from app.utils.image import save_profile_image, delete_profile_image, validate_image
from app.models.base import Users
from sqlalchemy import select

logger = get_logger(__name__)


# ここでrouter = APIRouter(prefix="/profiles",  # "/profiles" tags=["profiles"])は必要ない
# main.pyでファイル名がパスになるように設定している
router = APIRouter()
# パスでログインした時の処理
# @router.post('/')  # プロフィール作成のエンドポイント
# @router.get('/{user_id}')  # プロフィール取得のエンドポイント
# @router.put('/{profile_id}')  # プロフィール更新のエンドポイント


@router.post(
    "/", response_model=ResponseProfile, operation_id="create_profile"
)  # スペースを含まないIDを明示的に指定
async def create_profile_endpoint(
    name: str = Form(...),  # ... は必須という意味
    team_name: str = Form(...),
    birthday: str = Form(...),
    player_dominant: str = Form(...),
    player_position: str = Form(...),
    firebase_uid: str = Form(...),
    admired_player: Optional[str] = Form(None),
    introduction: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_async_db),
):
    try:
        logger.info("プロフィール作成リクエスト受信")

        if len(name) > 50:
            raise HTTPException(
                status_code=400, detail="名前は50字以内で入力してください"
            )

        if len(team_name) > 50:
            raise HTTPException(
                status_code=400, detail="チーム名は50字以内で入力してください"
            )

        if admired_player and len(admired_player) > 50:
            raise HTTPException(
                status_code=400, detail="憧れの選手は50字以内で入力してください"
            )

        if introduction and len(introduction) > 500:
            raise HTTPException(
                status_code=400, detail="自己紹介は500字以内で入力してください"
            )

        try:
            birth_date = datetime.strptime(birthday, "%Y-%m-%d").date()
            today = date.today()
            min_date = date(1900, 1, 1)

            if birth_date > today:
                raise HTTPException(
                    status_code=400,
                    detail="生年月日は今日より前の日付を入力してください",
                )
            if birth_date < min_date:
                raise HTTPException(
                    status_code=400,
                    detail="生年月日は1900年以降の日付を入力してください",
                )
        except ValueError:
            raise HTTPException(
                status_code=400, detail="生年月日の形式が正しくありません"
            )

        try:
            # Firebase UIDとしてユーザーを検索
            user_result = await db.execute(
                select(Users).where(Users.firebase_uid == firebase_uid)
            )
            user = user_result.scalar_one_or_none()
            user_id = user.id
        except ValueError as e:
            raise HTTPException(status_code=404, detail=f"{e}ユーザーが見つかりません")

        image_path = None  # プロフィール作成なので、画像は保存されていない状態
        # Firebaseに保存してから、URLを作成するためのパスのみを取得している
        # image_pathにしているのはデータベースに保存するため
        if image and image.filename:
            image_path = await save_profile_image(image)

        # CreateProfileモデルを作成
        try:
            profile_data = CreateProfile(
                user_id=user_id,
                name=name,
                team_name=team_name,
                birthday=birth_date,
                player_dominant=player_dominant,
                player_position=player_position,
                admired_player=admired_player,
                introduction=introduction,
                image_path=image_path,
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # プロフィールをデータベースに保存
        db_profile = await profile_crud.create_profile(db, profile_data)
        logger.info(f"プロフィール作成成功： {db_profile.id}")

        # 作成したプロフィールをレスポンスモデルに変換 ここでschemasのレスポンスモデルとデータベースのモデルで違い
        response_data = ResponseProfile.model_validate(db_profile)
        return response_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"プロフィール作成エラー： {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"プロフィール作成中にエラー： {str(e)}"
        )


@router.get(
    "/all",
    response_model=ResponseProfileList,
    operation_id="get_all_profile",
)
async def get_all_profile(db: AsyncSession = Depends(get_async_db)):
    try:
        logger.info("全選手のプロフィール取得のリクエスト受信成功")
        try:
            all_profiles = await profile_crud.get_all_profile(db)

            if not all_profiles:
                logger.info("プロフィールが見つかりません")
                return {"items": []}  # 空のリストを返す（エラーではない）

            # 各プロフィールをResponseProfileモデルに変換（None値をフィルタリング）
            response_profiles = []
            for profile in all_profiles:
                if profile is not None:  # None値をチェック
                    try:
                        response_profiles.append(
                            ResponseProfile.model_validate(profile)
                        )
                    except Exception as e:
                        logger.error(f"プロフィール変換エラー: {str(e)}")
                        # エラーが発生したプロフィールはスキップ

            return {"items": response_profiles}

        except ValueError as e:
            logger.error(f"プロフィール情報取得エラー: {str(e)}")
            return {"items": []}  # エラー時も空のリストを返す

    except Exception as e:
        logger.info(f"全選手のプロフィール情報取得エラー: {str(e)}")
        # 500エラーを返さず、空のリストを返す
        return {"items": []}


@router.get(
    "/{firebase_uid}", response_model=ResponseProfile, operation_id="get_profile"
)
async def get_profile_endpoint(
    firebase_uid: str, db: AsyncSession = Depends(get_async_db)
):
    try:
        logger.info("プロフィール取得リクエスト受信成功")
        # プロフィール取得
        try:
            # Firebase UIDとして検索
            profile = await profile_crud.get_profile_by_firebase_uid(db, firebase_uid)
        except ValueError as e:
            raise HTTPException(
                status_code=404, detail=f"{e}プロフィールが存在しません"
            )

        if profile is None:
            logger.info(f"ユーザー{firebase_uid}のプロフィールが存在しません")

        logger.info("プロフィール取得成功")
        response_profile = ResponseProfile.model_validate(profile)
        return response_profile
    except HTTPException:
        # HTTPExceptionをそのまま再送出
        raise
    except Exception as e:
        logger.error(f"プロフィール情報取得エラー： {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"プロフィール取得中にエラー： {str(e)}"
        )


@router.put(
    "/{profile_id}", response_model=ResponseProfile, operation_id="update_profile"
)
async def update_profile_endpoint(
    profile_id: UUID,
    name: Optional[str] = Form(None),
    team_name: Optional[str] = Form(None),
    birthday: Optional[str] = Form(None),
    player_dominant: Optional[str] = Form(None),
    player_position: Optional[str] = Form(None),
    admired_player: Optional[str] = Form(None),
    introduction: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    delete_image: bool = Form(False),
    db: AsyncSession = Depends(get_async_db),
):
    try:
        logger.info("プロフィール更新リクエスト受信")
        existing_profile = await profile_crud.get_profile_by_id(db, profile_id)
        if not existing_profile:
            raise HTTPException(
                status_code=404, detail="プロフィールが見つかりません"
            )  # raise は例外を手動で発生させるPythonのキーワードです

        # 入力値の基本検証
        if name is not None and len(name) > 50:
            raise HTTPException(
                status_code=400, detail="名前は50字以内で入力してください"
            )
        if team_name is not None and len(team_name) > 50:
            raise HTTPException(
                status_code=400, detail="チーム名は50字以内で入力してください"
            )
        if admired_player is not None and len(admired_player) > 50:
            raise HTTPException(
                status_code=400, detail="憧れの選手は50字以内で入力してください"
            )
        if introduction is not None and len(introduction) > 500:
            raise HTTPException(
                status_code=400, detail="自己紹介は500字以内で入力してください"
            )

        update_data = {}
        if name is not None:
            update_data["name"] = name
        if team_name is not None:
            update_data["team_name"] = team_name

        # 誕生日のバリデーションと変換
        if birthday is not None:
            try:
                birth_date = datetime.strptime(birthday, "%Y-%m-%d").date()
                today = date.today()
                min_date = date(1900, 1, 1)

                if birth_date > today:
                    raise HTTPException(
                        status_code=400,
                        detail="生年月日は今日より前の日付を入力してください",
                    )
                if birth_date < min_date:
                    raise HTTPException(
                        status_code=400,
                        detail="生年月日は1900年以降の日付を入力してください",
                    )

                update_data["birthday"] = birth_date
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="生年月日の形式が正しくありません"
                )

        if player_dominant is not None:
            update_data["player_dominant"] = player_dominant
        if player_position is not None:
            update_data["player_position"] = player_position
        if admired_player is not None:
            update_data["admired_player"] = admired_player
        if introduction is not None:
            update_data["introduction"] = introduction

        # 画像の処理
        if delete_image and existing_profile.image_path:
            # 画像を削除する場合
            await delete_profile_image(existing_profile.image_path)
            update_data["image_path"] = None
        elif image and image.filename:
            # 新しい画像をアップロードする場合
            await validate_image(image)

            if existing_profile.image_path:
                # 既存の画像があれば削除
                await delete_profile_image(existing_profile.image_path)

            # 新しい画像を保存してパスを取得
            new_image_path = await save_profile_image(image)
            update_data["image_path"] = new_image_path  # ここで更新データに追加

        if not update_data:
            raise HTTPException(status_code=400, detail="更新するデータがありません")

        try:
            # **辞書（dictionary）のキーと値のペアを関数やクラスの引数として展開する役割
            update_profile_data = UpdateProfile(**update_data)
            updated_profile = await profile_crud.update_profile(
                db, profile_id, update_profile_data
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        if not updated_profile:
            raise HTTPException(
                status_code=404, detail="プロフィールの更新に失敗しました"
            )
        logger.info(f"プロフィール更新成功： {profile_id}")
        response_profile = ResponseProfile.model_validate(updated_profile)
        return response_profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"プロフィール更新エラー: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"エラー: {str(e)}")


@router.get(
    "/by-userid/{user_id}",
    response_model=ResponseProfile,
    operation_id="get_profile_by_user_id",
)
async def get_profile_by_user_id_endpoint(
    user_id: UUID, db: AsyncSession = Depends(get_async_db)
):
    try:
        logger.info(f"ユーザーID {user_id} からプロフィール取得リクエスト受信")
        # プロフィール取得
        profile = await profile_crud.get_profile_by_user_id(db, user_id)

        if profile is None:
            logger.info(f"ユーザーID {user_id} のプロフィールが存在しません")
            raise HTTPException(status_code=404, detail="プロフィールが存在しません")

        logger.info(f"ユーザーID {user_id} のプロフィール取得成功")
        response_profile = ResponseProfile.model_validate(profile)
        return response_profile
    except HTTPException:
        # HTTPExceptionをそのまま再送出
        raise
    except Exception as e:
        logger.error(f"プロフィール情報取得エラー： {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"プロフィール取得中にエラー： {str(e)}"
        )
