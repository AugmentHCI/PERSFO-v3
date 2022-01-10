from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel

from db_status import get_db_status
from recommender import content_based_recommendation
from fastapi_utils.tasks import repeat_every
import logging

logging.basicConfig(filename='app.log', filemode='w', format='%(asctime)s %(levelname)s %(message)s',
                    level=logging.ERROR)
logger = logging.getLogger(__name__)


class SimilarRecipesParameters(BaseModel):
    recipe_name: str
    num_recipes: Optional[int] = 10


class UserRecipesParameters(BaseModel):
    num_recipes: int = 10
    topk_ingredients: int = 5
    ingredients_to_remove: list = [
                "Water", "Gejodeerd zout", "Gejodeerdzout", "Zout", "Peper", "Witte peper", "Wittepeper",
                "Maïszetmeel", "Specerij", "Saus", "Kruidenmix", "Kruiden", "Suiker", "Kristalsuiker",
                "Olijfolie", "Boter", "Vetstof", "Smaakmaker", "Stabilisatoren"
            ]
    save_to_db: bool = True


app = FastAPI()


@app.get("/")
async def root():
    return get_db_status()


# @app.get("/all-recipes")
# async def get_all_recipes():
#     data = db_crud.get_all_recipes()
#     return {"recipes": data}


# Run recommendations on API startup and every 24 hours
@app.on_event("startup")
@repeat_every(seconds=24 * 60 * 60)  # 24 hours
def periodic():
    user_recipes_parameters = UserRecipesParameters()
    try:
        output = content_based_recommendation(
            user_recipes_parameters.num_recipes,
            user_recipes_parameters.topk_ingredients,
            user_recipes_parameters.ingredients_to_remove,
            user_recipes_parameters.save_to_db
        )
    except Exception as e:
        logging.error(e, exc_info=True)


@app.post("/cal-all-user-recipes/")
async def get_content_based_recommendation(user_recipes_parameters: UserRecipesParameters):
    try:
        output = content_based_recommendation(
            user_recipes_parameters.num_recipes,
            user_recipes_parameters.topk_ingredients,
            user_recipes_parameters.ingredients_to_remove,
            user_recipes_parameters.save_to_db
        )
    except Exception as e:
        logging.error(e, exc_info=True)
        return {
            "error": {
                "message": "An error occurred while calculating user recipes.",
                "type": str(e)
            }
        }
    else:
        return output
