# README

DBと uvicorn を含めて docker 化しています。

# 目次 (Table of Contents)
1. [必須環境 (Required Configuration)](#必須環境required-configuration)
2. [プロジェクト構造 (Project Structures)](#プロジェクト構造project-structures)
3. [インストール&使い方 (Installations & How to use)](#インストール使い方installations--how-to-use)
    - [.env ファイルを準備](#env-ファイルを準備)
    - [docker コンテナのビルド & 起動](#docker-コンテナのビルド--起動)
    - [Web コンテナ内に入る](#web-コンテナ内に入る)
    - [DB 初期化、migration、seed 投入](#db-初期化migrationseed-投入)
4. [API 管理画面 (OpenAPI) 表示](#api-管理画面openapi表示)
5. [pre-commit](#pre-commit)
6. [機能 (Features)](#機能features)
    - [タスクランナー管理](#タスクランナー管理)
    - [DB レコードの作成・取得・更新・削除 (CRUD)](#db-レコードの作成取得更新削除crud)
    - [論理削除の CRUD 管理 (Software delete)](#論理削除の-crud-管理software-delete)
    - [認証 (Auth)](#認証auth)
    - [権限 (Scopes)](#権限scopes)
    - [キャメルケースとスネークケースの相互変換 (Mutual conversion between CamelCase and SnakeCase)](#キャメルケースとスネークケースの相互変換mutual-conversion-between-camelcase-and-snakecase)
    - [OpenAPI Generator を使用してバックエンドの型定義をフロントエンドでも使用する](#openapi-generator-を使用してバックエンドの型定義をフロントエンドでも使用する)
    - [バッチ処理 (Batch)](#バッチ処理batch)
    - [Settings](#settings)
    - [CORS-ORIGIN](#cors-origin)
    - [ErrorException](#errorexception)
    - [AppManager](#appmanager)
    - [logging](#logging)
    - [テスト (Testing)](#テストtesting)
    - [ログの集中管理 (Sentry log management)](#ログの集中管理sentry-log-management)
    - [DB マイグレーション (DB migrations)](#db-マイグレーションdb-migrations)
    - [fastapi-debug-toolbar](#fastapi-debug-toolbar)
    - [Linter](#linter)
    - [Elasticsearch](#elasticsearch)

# 必須環境(Required Configuration)

- Python 3.9+

# プロジェクト構造(Project Structures)

```text
.
├── Dockerfile          // 通常使用するDockerfile
├── Makefile            // タスクランナーを定義したMakefile
├── Procfile
├── alembic             // migrationに使用するalembicのディレクトリ
│   ├── README
│   ├── env.py
│   ├── script.py.mako
│   └── versions
│       └── 20230131-0237_.py
├── alembic.ini
├── app                 // mainのソースコードディレクトリ
│   ├── __init__.py
│   ├── api             // WebAPI Endpoint
│   │   └── endpoints
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── develop.py
│   │       ├── tasks.py
│   │       ├── todos.py
│   │       └── users.py
│   ├── commands
│   │   ├── __init__.py
│   │   ├── __set_base_path__.py
│   │   └── user_creation.py
│   ├── core            // 共通するCore機能
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── logger
│   │   │   ├── __init__.py
│   │   │   └── logger.py
│   │   └── utils.py
│   ├── crud　       // crudディレクトリ (sqlalchemy v2対応)
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── tag.py
│   │   ├── todo.py
│   │   └── user.py
│   ├── exceptions      // expectionsの定義
│   │   ├── __init__.py
│   │   ├── core.py
│   │   ├── error_messages.py
│   │   └── exception_handlers.py
│   ├── logger_config.yaml
│   ├── main.py         // fastapiのmainファイル。uvicornで指定する
│   ├── models          // DBテーブルのmodel
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── tags.py
│   │   ├── todos.py
│   │   ├── todos_tags.py
│   │   └── users.py
│   └── schemas         // 外部入出力用のschema
│       ├── __init__.py
│       ├── core.py
│       ├── language_analyzer.py
│       ├── request_info.py
│       ├── tag.py
│       ├── todo.py
│       ├── token.py
│       └── user.py
├── docker-compose.es.yml
├── docker-compose.yml
├── docs
│   ├── docs
│   │   ├── index.md
│   │   └── install.md
│   └── mkdocs.yml
├── elasticsearch
│   ├── docker-compose.yml
│   ├── elasticsearch
│   │   └── Dockerfile.es
│   ├── logstash
│   │   ├── Dockerfile
│   │   └── pipeline
│   │       └── main.conf
│   └── readme.md
├── flake8.ini
├── mypy.ini
├── pyproject.toml
├── Makefile
├── readme.md
├── requirements-dev.lock
├── requirements.lock
├── runtime.txt
├── seeder                        // seedの定義、インポーター
│   ├── run.py
│   └── seeds_json
│       ├── todos.json
│       └── users.json
└── tests                         // test
    ├── __init__.py
    ├── base.py
    ├── conftest.py
    ├── testing_utils.py
    └── todos
        ├── __init__.py
        ├── conftest.py
        └── test_todos.py
```

# インストール&使い方(Installations & How to use)

### .env ファイルを準備

.envファイルに以下の開発に必要なキーを記載してください。
必要なファイルも取得してください。
```
ENV=local
DEBUG=false
DB_HOST=db
DB_PORT=5432
DB_NAME=docker
DB_USER_NAME=docker
DB_PASSWORD=docker
```

### docker コンテナのビルド & 起動

```
docker compose up --build
```

### DB 初期化、migration、seed 投入

以下のコマンドで、DB の初期化、migrate、seed データ投入までの一連の処理を一括で行うことができます。

```bash
make init-db
```

### Web コンテナ内に入リたい場合

以下のいずれかのコマンドで Web コンテナ内に入ることができます。

```bash
docker compose run --rm web bash
```

or

Linux or macOS only

```bash
make docker-run
```

## API 管理画面(OpenAPI)表示

ローカル環境

```
http://localhost:8080/docs
```

Debug モード(F5 押下)で起動した場合
※Debug モードの場合は、ブレークポイントでローカル変数を確認できます。

```
http://localhost:8081/docs
```
### OpenAPIでAPIエンドポイントのテストをする方法

https://zenn.dev/sh0nk/books/537bb028709ab9/viewer/0a38c1#api%E3%81%AE%E7%AB%8B%E3%81%A1%E4%B8%8A%E3%81%92



## pre-commit
commit 前に linter 等のチェックを自動で行う場合は、pre-commit をインストール後に、以下コマンドで pre-commit を有効化することで、commit 時に自動的にチェックができるようになります。

```bash
pre-commit install
```

# 機能(Features)

## タスクランナー管理

makefile でタスクランナーを管理しています。
詳しい定義内容は、Makefile を参照してください。

## DB レコードの作成・取得・更新・削除(CRUD)

crud/base.py に CRUD の共通 Class を実装しています。
個別の CRUD 実装時は、この共通 Class を継承して個別処理を実装してください。

## 論理削除の CRUD 管理(Software delete)

DB レコード削除時に実際には削除せず deleted_at に削除日付をセットすることで
論理削除を実装しています。

以下のように SQLAlchemy の event 機能を使用して、ORM 実行後に自動的に論理削除レコードを除外するための filter を追加しています。
これにより、個別の CRUD で論理削除を実装する必要がなくなります。
include_deleted=True とすると、論理削除済レコードも取得できます。

```python
@event.listens_for(Session, "do_orm_execute")
def _add_filtering_deleted_at(execute_state):
    """
    論理削除用のfilterを自動的に適用する
    以下のようにすると、論理削除済のデータも含めて取得可能
    query(...).filter(...).execution_options(include_deleted=True)
    """
    logger.info(execute_state)
    if (
        not execute_state.is_column_load
        and not execute_state.is_relationship_load
        and not execute_state.execution_options.get("include_deleted", False)
    ):
        execute_state.statement = execute_state.statement.options(
            orm.with_loader_criteria(
                ModelBase,
                lambda cls: cls.deleted_at.is_(None),
                include_aliases=True,
            )
        )

```

## 認証(Auth)

.envファイルの`AUTH_SKIP`の値で認証のオンオフを制御できます。

`true`の場合は認証がスキップされ、`false`の場合は認証が適用されます。

## 権限(Scopes)

特定の User のみが実行できる API を作成する場合は、
table の user.scopes の値と router に指定した scope を一致させてください。

```python
@router.get(
    "/{id}",
    response_model=schemas.UserResponse,
    dependencies=[Security(get_current_user, scopes=["admin"])],
)
```

## キャメルケースとスネークケースの相互変換(Mutual conversion between CamelCase and SnakeCase)

Python ではスネークケースが標準ですが、Javascript ではキャメルケースが標準なため
単純に pydantic で schema を作成しただけでは、json レスポンスにスネークケースを使用せざるをえない問題があります。

そこで、以下のような BaseSchema を作成して、キャメルケース、スネークケースの相互変換を行なっています。
pydantic v2では、```from pydantic.alias_generators import to_camel```をインポートして、ConfigDictのalias_generatorにセットすることで、簡単にキャメルケースとスネークケースの相互変換が実現できます。

```python
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

class BaseSchema(BaseModel):
    """全体共通の情報をセットするBaseSchema"""

    # class Configで指定した場合に引数チェックがされないため、ConfigDictを推奨
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, strict=True)


```

## OpenAPI Generator を使用してバックエンドの型定義をフロントエンドでも使用する

FastAPI を使用するとエンドポイントを作成した段階で openapi.json が自動生成されます。

OpenAPI-Generator は、この openapi.json を読み込んで、フロントエンド用の型定義や API 呼び出し用コードを自動生成する仕組みです。

docker-compose 内で定義しており、docker compose up で実行される他、`make openapi-generator`を実行すると openapi-generator だけを実行できます。

生成されたコードは、`/front/types/generated`に格納されます。(-o オプションで変更可能)

```yml
# openapiのclient用のコードを自動生成するコンテナ
openapi-generator:
  image: openapitools/openapi-generator-cli
  depends_on:
    web:
      condition: service_healthy
  volumes:
    - ../front:/front
  command: generate -i http://web/openapi.json -g typescript-axios -o /front/types/generated --skip-validate-spec
  networks:
    - fastapi_network
```

## バッチ処理(Batch)

サブディレクトリ配下の py ファイルから、別ディレクトリのファイルを import する場合は
その前に以下のコードを記述する必要があります。

```python
sys.path.append(str(Path(__file__).absolute().parent.parent))
```

batch/**set_base_path**.py に記述し、各ファイルの先頭で import することで
より簡単に import できるようにしています。

## Settings

core/config.py にて、BaseSettings を継承して共通設定 Class を定義しています。
.env ファイルから自動的に設定を読み込むことができる他、個別に設定を定義することもできます。

## CORS-ORIGIN

CORS ORIGIN は大きく２パターンの設定方法があります。
allow_origins に list を指定する方法では、settings.CORS_ORIGINS に url を指定することで
任意の ORIGIN が設定可能です。
また、https://\*\*\*\*.example.com のようにサブドメインを一括で許可したい場合は
allow_origin_regex に以下のように正規表現で URL パターンを指定してください。

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
    allow_origin_regex=r"^https?:\/\/([\w\-\_]{1,}\.|)example\.com",
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## ErrorException

exceptions/error_messages.py にエラーメッセージを定義しています。
APIException と併せて以下のように、呼び出すことで、任意の HTTP コードのエラーレスポンスを作成できます。

```python
raise APIException(ErrorMessage.INTERNAL_SERVER_ERROR)
```

レスポンス例

```
http status code=400
{
  "detail": {
    "error_code": "INTERNAL_SERVER_ERROR",
    "error_msg": "システムエラーが発生しました、管理者に問い合わせてください"
  }
}
```

## AppManager

FastAPIのmount機能を使うと、多くのAPIを作成する場合などopenapiを複数画面に分割することができますが、openapi間のリンクが不便になる問題があります。
そこで、複数のFastAPIのappを統合管理できるFastAPIAppManagerクラスを構築しています。

FastAPIAppManagerを使用して、複数のappをadd_appで追加していくことで、複数のappに対する共通処理を実行することができます。

一例として以下の実装では、setup_apps_docs_link()でopenapiの上部に表示するapp間のlinkを生成しています。

```python
# main.py
app = FastAPI(
    title=settings.TITLE,
    version=settings.VERSION,
    debug=settings.DEBUG or False,
)
app_manager = FastAPIAppManager(root_app=app)
# appを分割する場合は、add_appで別のappを追加する
app_manager.add_app(path="admin", app=admin_app.app)
app_manager.add_app(path="other", app=other_app.app)
app_manager.setup_apps_docs_link()
```

```python
# app_manager.py
class FastAPIAppManager():

    def __init__(self, root_app: FastAPI):
        self.app_path_list: list[str] = [""]
        self.root_app: FastAPI = root_app
        self.apps: list[FastAPI] = [root_app]

    def add_app(self, app: FastAPI, path: str) -> None:
        self.apps.append(app)
        if not path.startswith("/"):
            path = f"/{path}"
        else:
            path =path
        self.app_path_list.append(path)
        app.title = f"{self.root_app.title}({path})"
        app.version = self.root_app.version
        app.debug = self.root_app.debug
        self.root_app.mount(path=path, app=app)

    def setup_apps_docs_link(self) -> None:
        """ 他のAppへのリンクがopenapiに表示されるようにセットする """
        for app, path in zip(self.apps, self.app_path_list):
            app.description = self._make_app_docs_link_html(path)

    def _make_app_docs_link_html(self, current_path: str) -> str:
        # openapiの上部に表示する各Appへのリンクを生成する
        descriptions = [
            f"<a href='{path}/docs'>{path}/docs</a>" if path != current_path else f"{path}/docs"
            for path in self.app_path_list
        ]
        descriptions.insert(0, "Apps link")
        return "<br>".join(descriptions)
```


## logging

logger_config.yaml で logging 設定を管理しています。可読性が高くなるように yaml で記述しています。
uviron の起動時に`--log-config ./app/logger_config.yaml` のように option 指定して logger 設定を行います。

```yaml
version: 1
disable_existing_loggers: false # 既存のlogger設定を無効化しない

formatters: # formatterの指定、ここではjsonFormatterを使用して、json化したlogを出力するようにしている
  json:
    format: "%(asctime)s %(name)s %(levelname)s  %(message)s %(filename)s %(module)s %(funcName)s %(lineno)d"
    class: pythonjsonlogger.jsonlogger.JsonFormatter

handlers: # handerで指定した複数種類のログを出力可能
  console:
    class: logging.StreamHandler
    level: DEBUG
    formatter: json
    stream: ext://sys.stdout

loggers: # loggerの名称毎に異なるhandlerやloglevelを指定できる
  backend:
    level: INFO
    handlers: [console]
    propagate: false

  gunicorn.error:
    level: DEBUG
    handlers: [console]
    propagate: false

  uvicorn.access:
    level: INFO
    handlers: [console]
    propagate: false

  sqlalchemy.engine:
    level: INFO
    handlers: [console]
    propagate: false

  alembic.runtime.migration:
    level: INFO
    handlers: [console]
    propagate: false

root:
  level: INFO
  handlers: [console]
```

## テスト(Testing)

tests/ 配下に、テスト関連の処理を、まとめています。

- `tests/base.py`
  - APIテスト用のベースClassが定義されているので、これを継承することで簡単にテスト関数を構築できます。
- `tests/conftest.py`
  - テスト全体で使用する設定やDB、HTTPクライアントの定義を行っています。
- `tests/testing_utils.py`
  - テストで使用するユーティリティ関数が含まれています。
- `tests/todos/conftest.py`
  - DBにテスト用のデータを挿入するための非同期フィクスチャを提供します。
- `tests/todos/test_todos.py`
  - Todo APIエンドポイントをテストするためのテストケースを構築しています。

実行時は、`make test`で実行できます。個々のテストケースを実行する場合は`make docker-run`でコンテナに入った後に`pytest tests/any/test/path.py`のようにファイルやディレクトリを指定して実行できます。

pytest.fixture を使用して、テスト関数毎に DB の初期化処理を実施しているため、毎回クリーンな DB を使用してステートレスなテストが可能です。

DB サーバーは docker で起動する DB コンテナを共用しますが、同じデータベースを使用してしまうと、テスト時にデータがクリアされてしまうので、別名のデータベースを作成しています。

pytest では conftest.py に記述した内容は自動的に読み込まれるため、conftest.py にテストの前処理を記述しています。

tests/conftest.py には、テスト全体で使用する設定の定義や DB や HTTP クライアントの定義を行っています。

conftest.py は実行するテストファイルのある階層とそれより上の階層にあるものしか実行されないため、以下の例で test_todos.py を実行した場合は、`tests/todos/conftest.py` と `tests/conftest.py` のみが実行されます。

```
test/
  conftest.py
  -- todos/
   -- conftest.py
   -- test_todos.py
  -- any-test/
   -- conftest.py
   -- test_any-test.py
```

この仕様を活かして、todos/などの個々のテストケースのディレクトリ配下の conftest.py では、以下のように対象のテストケースのみで使用するデータのインポートを定義しています。

```python
@pytest.fixture
def data_set(db: Session):
    insert_todos(db)


def insert_todos(db: Session):
    now = datetime.datetime.now()
    data = [
        models.Todo(
            id=str(i),
            title=f"test-title-{i}",
            description=f"test-description-{i}",
            created_at=now - datetime.timedelta(days=i),
        )
        for i in range(1, 25)
    ]
    db.add_all(data)
    db.commit()
```

fixture で定義した data_set は、以下のようにテスト関数の引数に指定することで、テスト関数の前提処理として実行することができます。

引数に、`authed_client: Client`を指定することで、ログイン認証済の HTTP クライアントが取得できます。`client: Client`を指定した場合は、未認証の HTTP クライアントが取得できます。

API エンドポイント経由のテストではなく、db セッションを直接指定するテストの場合は、`db: Session`を引数に指定することで、テスト用の db セッションを取得できます。

```python
    def test_get_by_id(
        self,
        authed_client: Client,
        id: str,
        expected_status: int,
        expected_data: Optional[dict],
        expected_error: Optional[dict],
        data_set: None, # <-- here
    ) -> None:
        self.assert_get_by_id(
            client=authed_client,
            id=id,
            expected_status=expected_status,
            expected_data=expected_data,
        )
```

```tests/base.py```にAPIテスト用のベースClassが定義されているので、これを継承することで、簡単にテスト関数を構築することができます。

以下の例では、TestBaseクラスを継承して、TestTodosクラスを作成しています。ENDPOINT_URIにテスト対象のAPIエンドポイントのURIを指定することで、CRUD全体で使用できます。

pytestのparametrizeを使用しており、１つのテスト関数で複数のテストケースを定義できます。



```python
class TestTodos(TestBase):
    ENDPOINT_URI = "/todos"

    """create
    """

    @pytest.mark.parametrize(
        ["data_in", "expected_status", "expected_data", "expected_error"],
        [
            pytest.param(
                TodoCreate(title="test-create-title", description="test-create-description").model_dump(by_alias=True),
                status.HTTP_200_OK,
                {"title": "test-create-title", "description": "test-create-description"},
                None,
                id="success",
            ),
            pytest.param(
                TodoCreate(title="test-create-title", description="test-create-description").model_dump(by_alias=True),
                status.HTTP_200_OK,
                {"title": "test-create-title", "description": "test-create-description"},
                None,
                id="any-test-case",
            )
        ],
    )
    def test_create(
        self,
        authed_client: Client,
        data_in: dict,
        expected_status: int,
        expected_data: Optional[dict],
        expected_error: Optional[dict],
    ) -> None:
        self.assert_create(
            client=authed_client,
            data_in=data_in,
            expected_status=expected_status,
            expected_data=expected_data,
        )
```

## ログの集中管理(Sentry log management)

.env ファイルの SENTRY_SDK_DNS を設定すると、error 以上の logging が発生した場合に
sentry に自動的に logging されます。

## DB マイグレーション(DB migrations)

alembic/versions.py にマイグレーション情報を記述すると、DB マイグレーション(移行)を実施することができます。
以下を実行することで、models の定義と実際の DB との差分から自動的にマイグレーションファイルを作成できます。

```bash
make makemigrations m="any-migration-description-message"
```

以下を実行することで、マイグレーションが実行できます。

```bash
make migrate
```

### マイグレーション競合エラーへの対処
マイグレーション実行時、以下のエラーが出た場合の解決手順を解説します。

```bash
FAILED: Multiple heads are present; please specify the head revision on which the new revision should be based, or perform a merge.
```
このエラーは、Alembicのマイグレーション履歴に複数のヘッドが存在していることを示しています。これは通常、異なるブランチで別々のマイグレーションが作成された場合や、マイグレーションの競合が発生した場合に起こります。

①dockerコンテナに入る
```bash
docker compose run --rm web bash
```
②現在のマイグレーションの状態を確認
```bash
alembic heads
```
これにより、現在存在する複数のヘッドが表示される。

③これらのヘッドをマージするマイグレーションを作成
```bash
alembic merge -m "merge multiple heads" <revision1> <revision2>
```
revision1とrevision2は、alembic heads コマンドで表示されたリビジョン番号に置き換えてください。

例：
```bash
alembic merge -m "merge multiple heads" ab18be7095fe 82fe62445fc0 96d9241536af
```

④新しく作成されたマージマイグレーションを適用
```bash
alembic upgrade head
```

⑤コンテナを抜けてから以下を実行
```bash
make makemigrations m="any-migration-description-message"
```
```bash
make migrate
```



## fastapi-debug-toolbar

.env ファイルにて DEBUG=true を指定すると、Swaggar 画面から debug-toolbar が起動できます。

SQLAlchemy のクエリや Request など、django-debug-toolbar と同等の内容が確認できます。

## Linter
ruffというrustで構築された高速なLinterを使用しています。
pre-commitで実行することを想定しています。

## Elasticsearch

実験的に Elasticsearch の docker-compose.yml も定義しています。
FastAPI との連携は未対応のため、別途対応予定です。
