import os
import zipfile
import rjsmin

def advanced_minify_js(js_code):
    try:
        return rjsmin.jsmin(js_code)
    except Exception as e:
        print("Minification error:", e)
        return js_code

def zip_directory(path):
    root_dir = os.path.basename(path)
    zip_filename = root_dir + ".zip"
    with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(path):
            for file in files:
                if not file.endswith(".db"):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, path)
                    arcname = os.path.join(root_dir, rel_path).replace("\\", "/")
                    if file.endswith(".js"):
                        with open(file_path, "r", encoding="utf-8") as js_file:
                            original_code = js_file.read()
                            minified_code = advanced_minify_js(original_code)
                        zip_file.writestr(arcname, minified_code)
                    else:
                        zip_file.write(file_path, arcname=arcname)
            for dir in dirs:
                dir_path = os.path.join(root, dir)
                rel_path = os.path.relpath(dir_path, path)
                arcname = os.path.join(root_dir, rel_path).replace("\\", "/")
                zip_file.write(dir_path, arcname=arcname)
    print("Created", zip_filename)

# Adjust the directory names as needed
zip_directory("01CACCL_LRCCD-arc")
zip_directory("01CACCL_LRCCD-crc")
zip_directory("01CACCL_LRCCD-flc")
zip_directory("01CACCL_LRCCD-scc")
