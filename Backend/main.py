from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow React frontend to communicate with FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    text: str = None
    is_done:bool = False

items = []

@app.post("/items")
def create_item(item: Item):
    items.append(item)
    return items

@app.get("/items", response_model = list[Item])
def list_items(limit: int=100):
    return items[0:limit]

@app.get("/items/{item_id}", response_model = Item)
def get_item(item_id: int) -> Item:
    if 0 <= item_id < len(items):
        return items[item_id]
    else:
        raise HTTPException(status_code = 404, detail = f'Item {item_id} not found')

@app.delete ("/items/{item_id}") 
def delete_item(item_id: int):
    if 0 <= item_id < len(items):
        deleted = items.pop(item_id)
        return {"deleted": deleted}
    else:
        raise HTTPException(status_code = 404, detail = f'Item {item_id} not found')
        
@app.put("/items/{item_id}", response_model = Item)
def update_item(item_id: int, updated_item: Item):
    if 0 <= item_id < len(items):
        items[item_id] = updated_item
        return items[item_id]
    else:
        raise HTTPException(status_code = 404, detail = f'Item {item_id} not found')
