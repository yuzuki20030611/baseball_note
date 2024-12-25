async def save_temp_file(file) -> str:
    temp_file_path = f"/tmp/{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await file.read())
    return temp_file_path
