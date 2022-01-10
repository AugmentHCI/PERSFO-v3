from pymongo import MongoClient
from decouple import config

MONGO_URI = config('MONGO_URI', default='mongodb://mongo:27017/meteor')

myclient = MongoClient(MONGO_URI)
mydb = myclient["meteor"]
recipes_col = mydb["recipes"]
orders_col = mydb["orders"]
userpreferences_col = mydb["userpreferences"]


def get_all_recipes() -> list:
    cursor = recipes_col.find({}, {
        "id": 1,
        "cleanedIngredients": 1,
        "_id": False
    })

    try:
        return list(cursor)
    finally:
        myclient.close()


def get_confirmed_orders() -> list:
    cursor = orders_col.find({
            "$and": [
                {"confirmed": { "$exists": True}},
                {"confirmed": True}
            ]
    }, {
        "userid": True,
        "recipeId": True,
        "_id": False
    })
    return list(cursor)


def get_users_preference() -> dict:
    pipeline = [
        {
            u"$project": {
                u"_id": 0,
                u"orders": u"$$ROOT"
            }
        },
        {
            u"$lookup": {
                u"localField": u"orders.recipeId",
                u"from": u"recipes",
                u"foreignField": u"id",
                u"as": u"recipes"
            }
        },
        {
            u"$unwind": {
                u"path": u"$recipes",
                u"preserveNullAndEmptyArrays": False
            }
        },
        {
            u"$match": {
                u"orders.confirmed": True
            }
        },
        {
            u"$project": {
                u"orders.userid": u"$orders.userid",
                u"orders.recipeId": u"$orders.recipeId",
                u"recipes.cleanedIngredients": u"$recipes.cleanedIngredients",
                u"_id": 0
            }
        }
    ]

    cursor = orders_col.aggregate(
        pipeline,
        allowDiskUse=True
    )
    try:
        prefs_of_users = {}

        for doc in cursor:
            user_id = doc["orders"]["userid"]
            if user_id not in prefs_of_users:
                # recipes_of_users[user_id] = []
                prefs_of_users[user_id] = doc["recipes"]["cleanedIngredients"]
            else:
                prefs_of_users[user_id] += doc["recipes"]["cleanedIngredients"]
                # unique = list(set(recipes_of_users[user_id] + doc["recipes"]["cleanedIngredients"]))
                # recipes_of_users[user_id] = unique
            # recipes_of_users[user_id].append({
            #     "id": doc["orders"]["recipeId"],
            #     "cleanedIngredients": doc["recipes"]["cleanedIngredients"]
            # })
        return prefs_of_users
    finally:
        myclient.close()


def insert_recommendations(user_id: str, data_for_db: dict) -> int:
    result = userpreferences_col.update_many(
        filter={'userid': user_id},
        update={"$set": data_for_db}
    )
    return result.modified_count


if __name__ == "__main__":
    print(get_users_preference()["aSdiyJh9EgatGLr3M"])
    # pass
