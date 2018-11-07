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

newgals = []
with open('/dfotose/scripts/newgals') as f:
   newgals = [img.strip('\n') for img in f] 

# for gal in newgals:
#     pprint(gal)

for gal in newgals:
    # db.galleries.delete_one({'name' : gal})

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

        # db.images.delete_one({'filename' : name})

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
