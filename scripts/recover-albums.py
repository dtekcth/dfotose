#! /bin/python3
from pymongo import MongoClient
from bson.objectid import ObjectId
from pprint import pprint
from os import listdir
from os.path import join, isfile, splitext
import datetime

imgpath = '/dfotose/storage/images/'

client = MongoClient('mongo', 27017)
db = client.dfotose


gals_in_db = {str(g['_id']) for g in db.galleries.find()}
gals_saved = set(listdir(imgpath))
gals_not_in_db = gals_saved.difference(gals_in_db)

for gal in gals_not_in_db:
    db.galleries.insert_one({
        '_id' : ObjectId(gal),
        'description' : 'album ' + gal,
        'name' : gal,
        'published' : False,
        'shootDate' : datetime.datetime.utcnow()
    })

    galpath = join(imgpath, gal)
    images = {f for f in listdir(galpath) if isfile(join(galpath,f))}

    for img in images:
        name, ext = splitext(img)

        db.images.insert_one({
            'author' : 'DFoto',
            'authorCid' : 'DFoto',
            'exifData' : {},
            'filename' : name,
            'fullSize' : join(galpath, img),
            'galleryId' : gal,
            'preview' : join(galpath, 'previews', img),
            'thumbnail' : join(galpath, 'thumbnails', img),
            'tags' : [],
            'shotAt' : datetime.datetime.utcnow()
        })
