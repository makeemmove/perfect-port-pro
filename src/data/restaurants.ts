export interface Restaurant {
  name: string;
  sub: string;
  hours: string;
  loc: string;
  price: string;
  desc: string;
}

export const RESTAURANTS: Restaurant[] = [
  {name:"Sagres Restaurant",sub:"Portuguese",hours:"Lunch & Dinner",loc:"Fall River, MA",price:"$$$",desc:"Authentic Portuguese cuisine, reservations recommended"},
  {name:"Caldeiras Restaurant",sub:"Portuguese",hours:"Lunch & Dinner",loc:"Fall River, MA",price:"$$$",desc:"Traditional Portuguese restaurant, spacious dining"},
  {name:"Caravela Family Restaurant",sub:"Portuguese",hours:"Lunch & Dinner",loc:"637 S. Main St",price:"$$",desc:"Family-style Portuguese dining, casual atmosphere"},
  {name:"Douro Steakhouse (Towne House)",sub:"Portuguese",hours:"Dinner (Wed-Sat)",loc:"37 Purchase St",price:"$$$$",desc:"Modern Portuguese steakhouse, premium cuts, craft cocktails"},
  {name:"Barca Restaurant",sub:"Portuguese",hours:"Lunch & Dinner",loc:"85 Columbia St",price:"$$$",desc:"Authentic Portuguese cuisine, fresh seafood"},
  {name:"Marisqueira Azores Restaurant",sub:"Portuguese",hours:"Lunch & Dinner",loc:"1445 South Main St",price:"$$$",desc:"Seafood-focused Portuguese restaurant, reopened after fire"},
  {name:"Estoril Restaurant",sub:"Portuguese",hours:"Dinner (Wed-Sat)",loc:"1577 Pleasant St",price:"$$",desc:"Portuguese cuisine, casual dining"},
  {name:"Primo on Water Street",sub:"Italian",hours:"Lunch & Dinner",loc:"36 Water St",price:"$$$",desc:"Italian-American comfort food, 8,500 sq ft, locally sourced"},
  {name:"Patti's Pierogis",sub:"Italian",hours:"Lunch & Dinner",loc:"1019 S. Main St",price:"$$",desc:"Polish-Italian pierogis, golabkis, kielbasa, family recipes"},
  {name:"Marzilli's Bakery",sub:"Italian",hours:"Breakfast & Lunch",loc:"Fall River, MA",price:"$$",desc:"Italian bakery with fresh bread, grinders, soups"},
  {name:"Candela Cucina",sub:"Italian",hours:"Dinner",loc:"Fall River, MA",price:"$$$$",desc:"Upscale Italian, Chef Josh Riazi, covered patio bar"},
  {name:"Fiorentina Italian Kitchen",sub:"Italian",hours:"Lunch & Dinner",loc:"1833 North Main St",price:"$$$",desc:"Italian fare, pizza, pasta"},
  {name:"The Cove Restaurant & Marina",sub:"Seafood",hours:"Lunch & Dinner",loc:"392 Davol St",price:"$$$",desc:"Raw bar, lobster, oysters, scallops, steaks, boat access"},
  {name:"The Liberal Club Restaurant",sub:"Seafood",hours:"Lunch & Dinner",loc:"202 Pleasant St",price:"$$",desc:"Classic seafood, fried clams, grapenut pudding"},
  {name:"Macray's Seafood",sub:"Seafood",hours:"Lunch & Dinner",loc:"Tiverton, RI",price:"$$",desc:"Voted #1 for fried clams and clam cakes on South Coast"},
  {name:"Happy Garden",sub:"Asian",hours:"Lunch & Dinner",loc:"960 Pleasant St",price:"$$",desc:"Authentic Chinese cuisine, crab rangoon, lemon chicken"},
  {name:"Scottie's Pub",sub:"Casual Dining",hours:"Lunch & Dinner",loc:"202 Pleasant St",price:"$$",desc:"Sports bar, lobster rolls, karaoke, seafood pasta"},
  {name:"The Tipsy Toboggan",sub:"Casual Dining",hours:"Lunch & Dinner",loc:"75 Ferry St",price:"$$",desc:"Casual dining, burgers, sandwiches, local favorite"},
  {name:"Bun Buds",sub:"Specialty",hours:"Lunch & Dinner",loc:"10 Purchase St",price:"$$",desc:"Elevated dumplings, hot dogs, bao, Asian fusion (opened 2024)"},
  {name:"Grahams Hot Dogs",sub:"Specialty",hours:"Lunch",loc:"931 Bedford St",price:"$",desc:"Coney Island hot dogs, local institution"},
  {name:"Atlas Pizza",sub:"Specialty",hours:"Lunch & Dinner",loc:"761 Eastern Ave",price:"$$",desc:"Family-owned pizza since 1975, local favorite"},
  {name:"Barcelos Bakery",sub:"Bakery/Coffee",hours:"Breakfast & Lunch",loc:"Bedford St",price:"$$",desc:"Portuguese bakery, fresh bread, pastries, espresso, lattes"},
  {name:"Leddy's Bakery & Coffee Shop",sub:"Bakery/Coffee",hours:"Breakfast & Lunch",loc:"Fall River, MA",price:"$$",desc:"Donuts, pastries, meat pies, chicken pies, coffee"},
  {name:"Sam's Bakery",sub:"Bakery/Coffee",hours:"Breakfast & Lunch",loc:"256 Flint St",price:"$$",desc:"Local bakery, high ratings, variety of baked goods"},
  {name:"New Boston Bakery",sub:"Bakery/Coffee",hours:"Breakfast & Lunch",loc:"Fall River, MA",price:"$$",desc:"Traditional bakery, pastries, breads, coffee"},
  {name:"Miss Lizzie's Coffee",sub:"Bakery/Coffee",hours:"Breakfast & Lunch",loc:"242 Second St",price:"$$",desc:"Specialty coffee, tea, sandwiches, near Lizzie Borden House"},
  {name:"Mission Cold Brew",sub:"Bakery/Coffee",hours:"Breakfast & Lunch",loc:"657 Quarry St",price:"$",desc:"Cold brew coffee, specialty drinks"},
  {name:"Portugalia Marketplace",sub:"Market/Specialty",hours:"Shopping",loc:"Fall River, MA",price:"$$",desc:"Portuguese specialty food market, wines, pastries, groceries"},
];

export const COORDS: Record<string, [number, number]> = {
  "Sagres Restaurant":[41.7012,-71.1580],"Caldeiras Restaurant":[41.6990,-71.1555],
  "Caravela Family Restaurant":[41.6918,-71.1558],"Douro Steakhouse (Towne House)":[41.7028,-71.1547],
  "Barca Restaurant":[41.7001,-71.1589],"Marisqueira Azores Restaurant":[41.6835,-71.1576],
  "Estoril Restaurant":[41.6897,-71.1613],"Primo on Water Street":[41.7039,-71.1531],
  "Patti's Pierogis":[41.6905,-71.1558],"Marzilli's Bakery":[41.7003,-71.1545],
  "Candela Cucina":[41.7015,-71.1551],"Fiorentina Italian Kitchen":[41.7185,-71.1555],
  "The Cove Restaurant & Marina":[41.7054,-71.1614],
  "The Liberal Club Restaurant":[41.7006,-71.1568],"Macray's Seafood":[41.6240,-71.1830],
  "Happy Garden":[41.6973,-71.1619],
  "Scottie's Pub":[41.7005,-71.1566],"The Tipsy Toboggan":[41.7038,-71.1587],
  "Bun Buds":[41.7027,-71.1548],"Grahams Hot Dogs":[41.7011,-71.1571],
  "Atlas Pizza":[41.7105,-71.1488],
  "Barcelos Bakery":[41.7011,-71.1571],"Leddy's Bakery & Coffee Shop":[41.6999,-71.1543],
  "Sam's Bakery":[41.7018,-71.1540],"New Boston Bakery":[41.7020,-71.1558],
  "Miss Lizzie's Coffee":[41.7012,-71.1538],"Mission Cold Brew":[41.6958,-71.1492],
  "Portugalia Marketplace":[41.7025,-71.1562],
};
