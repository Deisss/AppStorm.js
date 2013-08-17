#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# -------------------------------
#   EXAMPLE SERVER
# -------------------------------
#

from bottle import get, post, run, template, request, response, static_file
import os, time

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
@get("/static/<filename:path>")
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
def getFileList():
  """ Searching files in storage folder and retrieve their name """
  fileList = [ f for f in os.listdir(serverPathStorage) if os.path.isfile(os.path.join(serverPathStorage, f)) ]
  return fileList


@get("/file/info/<filename:path>")
def getFile(filename):
  """ Get a specific file metadata """
  # Protect from accessing outside directory
  if ("/" in filename) or ("\\" in filename):
    return "{}"

  # Check file exist and is readable
  fpath = os.path.join(serverPathStorage, filename)
  try:
    open(fpath, "r").close()
  except IOError:
    return {"error" : "Unable to read file"}

  # Retrieve data
  return {
    "name"     : filename,
    "created"  : time.ctime(os.path.getctime(fpath)),
    "modified" : time.ctime(os.path.getmtime(fpath))
  }


@post("/file/post")
def uploadFile():
  """ Upload a file and store it """
  upload = request.files.get("upload")

  # Check extension
  name, ext = os.path.splitext(upload.filename)
  if ext not in (".png", ".jpg", ".jpeg", ".pdf", ".txt", ".zip"):
    print "File extension: %s" % ext
    return {"error" : "File extension not allowed"}

  # Save file into disk
  fpath = os.path.join(serverPathStorage, upload.filename)
  if not os.path.isfile(fpath):
    with open(fpath, 'w') as file:
	  file.write(upload.file.read())
    return {"success" : "OK"}
  return {"error" : "File already exist"}


@get("/file/download/<filename:path>")
def downloadFile(filename):
  """ Download an existing file """
  # Protect from accessing outside directory
  if ("/" in filename) or ("\\" in filename):
    return "{}"

  # Downloading file
  return static_file(filename, root=serverPathStorage, download=filename)
  




# Starting server
if __name__ == "__main__":
  run(host="localhost", port=8006)