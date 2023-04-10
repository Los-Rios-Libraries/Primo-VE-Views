import os
import zipfile
import requests

def minify_js(code):
    url = "https://closure-compiler.appspot.com/compile"
    params = {
        "compilation_level": "WHITESPACE_ONLY",
        "output_format": "text",
        "output_info": "compiled_code",
        "js_code": code
    }
    response = requests.post(url, data=params)
    return response.text.strip()

def zip_directory(path):
    root_dir = os.path.basename(path)
    zip_filename = root_dir + ".zip"
    with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(path):
            for file in files:
                if not file.endswith(".db"):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, path)
                    if file.endswith(".js"):
                        with open(file_path, "r") as js_file:
                            minified_code = minify_js(js_file.read())
                        zip_file.writestr(os.path.join(root_dir, rel_path).replace("\\", "/"), minified_code)
                    else:
                        zip_file.write(file_path, arcname=os.path.join(root_dir, rel_path).replace("\\", "/"))
            for dir in dirs:
                dir_path = os.path.join(root, dir)
                rel_path = os.path.relpath(dir_path, path)
                zip_file.write(dir_path, arcname=os.path.join(root_dir, rel_path).replace("\\", "/"))
    print("Created", zip_filename)

zip_directory("01CACCL_LRCCD-arc")
zip_directory("01CACCL_LRCCD-crc")
zip_directory("01CACCL_LRCCD-flc")
zip_directory("01CACCL_LRCCD-scc")
