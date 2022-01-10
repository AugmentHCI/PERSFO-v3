from pymongo import MongoClient
from decouple import config

MONGO_URI = config('MONGO_URI', default='mongodb://mongo:27017/meteor')

myclient = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1000)


def get_db_status():
    try:
        server_info = myclient.server_info()
        return {
            "status": "connected",
            "mongo url": MONGO_URI,
            "server info": server_info
        }
    except Exception as e:
        return {
            "error": {
                "message": "Could not connect to MongoDB",
                "type": str(e)
            }
        }

item_list = ["a","a","b","c","c"]
list_to_remove = ["a"]
final_list = list(set(item_list) - set(list_to_remove))
