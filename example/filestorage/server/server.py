#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# -------------------------------
#   EXAMPLE SERVER
# -------------------------------
#

from bottle import get, post, delete, run, template, request, abort, response, static_file
import os, time, md5

serverPathStorage = "./storage"
if not os.path.isdir(serverPathStorage):
  os.makedirs(serverPathStorage)

#
# -------------------------------
#   STATIC FILES & HOME
# -------------------------------
#
@get("/")
def index():
  """ Default index, server main file """
  content = None
  with open("../client/index.html", "r") as file:
    content = file.read()
  return template(content)


@get("/resource/<filename:path>")
def static(filename):
  """ Server static files """
  if "appstorm" in filename.lower():
    return staticAppStormJS(filename)
  return static_file(filename, root="../client/resource")


def staticAppStormJS(filename):
  """ Special static file to serve AppStorm.JS from original folder """
  return static_file(filename, root="../../../appstorm")


#
# -------------------------------
#   RESTFULL INTERFACE
# -------------------------------
#
@get("/file/list")
def listFile():
  """ Searching files in storage folder and retrieve their name """
  fileList = [ f for f in os.listdir(serverPathStorage) if os.path.isfile(os.path.join(serverPathStorage, f)) ]
  return fileList


@get("/file/info/<filename:path>")
def infoFile(filename):
  """ Get a specific file metadata """
  # Protect from accessing outside directory
  if ("/" in filename) or ("\\" in filename):
    abort(400, "You can access file outside storage folder")

  # Check file exist and is readable
  fpath = os.path.join(serverPathStorage, filename)
  try:
    open(fpath, "r").close()
  except IOError:
    abort(404, "File not Found")

  # Retrieve data
  m = md5.new()
  with open(fpath) as file:
    m.update(file.read())

  return {
    "name"     : filename,
    "checksum" : m.hexdigest(),
    "created"  : time.ctime(os.path.getctime(fpath)),
    "modified" : time.ctime(os.path.getmtime(fpath))
  }


@delete("/file/delete/<filename:path>")
def deleteFile(filename):
  """ Delete an existing file """
  # Protect from accessing outside directory
  if ("/" in filename) or ("\\" in filename):
    abort(400, "You can access file outside storage folder")

  # Check file exist and is readable
  fpath = os.path.join(serverPathStorage, filename)
  if not os.path.isfile(fpath):
    abort(404, "File not found")
  os.remove(fpath)
  return {"success" : "OK"}



@post("/file/upload")
def uploadFile():
  """ Upload a file and store it """
  upload = request.files.get("upload")

  # Check extension
  name, ext = os.path.splitext(upload.filename)
  if ext not in (".png", ".jpg", ".jpeg", ".pdf", ".txt", ".zip"):
    print "File extension: %s" % ext
    abort(400, "File extension not allowed")

  # Save file into disk
  fpath = os.path.join(serverPathStorage, upload.filename)
  if not os.path.isfile(fpath):
    with open(fpath, 'w') as file:
	  file.write(upload.file.read())
    return {"success" : "OK"}
  abort(409, "File already exist")


@get("/file/download/<filename:path>")
def downloadFile(filename):
  """ Download an existing file """
  # Protect from accessing outside directory
  if ("/" in filename) or ("\\" in filename):
    abort(400, "You can access file outside storage folder")

  # Downloading file
  return static_file(filename, root=serverPathStorage, download=filename)
  




# Starting server
if __name__ == "__main__":
  run(host="localhost", port=8006)