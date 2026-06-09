"""
Database Seeder — Pre-populate the fallback JSON store with
realistic historical prediction records so the site looks active.
Generates 8,000+ records spanning the past 18 months.
"""
import sys, json, random
from pathlib import Path
from datetime import datetime, timedelta

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SEED_COUNT  = 8000
DATA_DIR    = Path(__file__).resolve().parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "fallback_store.json"

DATA_DIR.mkdir(exist_ok=True)

rng = random.Random(42)

CITY_DATA = {
    "Mumbai":      {"base": 22000, "locs": ["Bandra West","Juhu","Worli","Lower Parel","Powai","Andheri West","Andheri East","Malad West","Borivali West","Thane","Navi Mumbai","Prabhadevi","Dadar","Mira Road","Vasai"], "mults": [2.10,2.00,2.20,1.80,1.30,1.20,1.00,0.90,0.85,0.75,0.70,1.85,1.50,0.60,0.55]},
    "Bangalore":   {"base": 8500,  "locs": ["Indiranagar","Koramangala","Richmond Town","Whitefield","HSR Layout","Jayanagar","JP Nagar","Electronic City","Hebbal","Sarjapur Road","Yelahanka","Marathahalli","Bellandur","Bannerghatta Road","Kengeri"], "mults": [1.90,1.85,2.00,1.40,1.35,1.30,1.20,0.85,1.10,1.15,0.80,1.10,1.05,1.00,0.70]},
    "Delhi NCR":   {"base": 12000, "locs": ["Lutyens Delhi","South Delhi","Golf Course Road","Gurgaon Sector 29","DLF Phase 1","Vasant Kunj","Dwarka","Rohini","Noida Sector 137","Noida Extension","Faridabad","Greater Noida","Ghaziabad","Indirapuram","Raj Nagar Extension"], "mults": [2.50,2.00,1.80,1.60,1.70,1.50,1.10,0.90,1.00,0.75,0.70,0.65,0.68,0.80,0.60]},
    "Pune":        {"base": 7200,  "locs": ["Boat Club Road","Koregaon Park","Baner","Kharadi","Wakad","Hinjewadi","Hadapsar","Undri","Talegaon","Pimpri Chinchwad","Aundh","Viman Nagar","Katraj","Kondhwa","Pisoli"], "mults": [2.00,1.90,1.40,1.20,1.10,1.00,0.85,0.80,0.65,0.75,1.30,1.25,0.70,0.78,0.62]},
    "Hyderabad":   {"base": 6800,  "locs": ["Banjara Hills","Jubilee Hills","HITEC City","Gachibowli","Kondapur","Manikonda","Miyapur","Bachupally","LB Nagar","Kompally","Kukatpally","Uppal","Nallagandla","Nizampet","Shamshabad"], "mults": [2.00,1.90,1.50,1.40,1.20,1.00,0.85,0.80,0.75,0.78,0.90,0.72,1.10,0.82,0.68]},
    "Chennai":     {"base": 6500,  "locs": ["Nungambakkam","Adyar","Anna Nagar","Velachery","OMR","Porur","Tambaram","Sholinganallur","Perambur","Guindy","Chrompet","Pallavaram","Teynampet","Mylapore","Madipakkam"], "mults": [1.90,1.80,1.60,1.20,1.00,0.90,0.75,1.10,0.70,1.05,0.78,0.80,1.50,1.40,0.85]},
    "Kolkata":     {"base": 5500,  "locs": ["Alipore","Ballygunge","Park Street","Salt Lake","New Town","Rajarhat","Dumdum","Behala","Howrah","Barrackpore","Garia","Jadavpur","Tollygunge","Lake Town","Santoshpur"], "mults": [2.00,1.80,1.70,1.40,1.30,1.00,0.80,0.78,0.75,0.65,0.72,1.10,1.05,1.15,0.82]},
    "Ahmedabad":   {"base": 5200,  "locs": ["Bodakdev","Prahlad Nagar","Satellite","Vastrapur","Thaltej","SG Highway","Bopal","Chandkheda","Naroda","Nikol","Motera","Gota","Shela","Maninagar","Odhav"], "mults": [1.80,1.70,1.50,1.40,1.30,1.20,1.00,0.85,0.70,0.65,0.90,0.92,1.05,0.80,0.68]},
    "Surat":       {"base": 4800,  "locs": ["Adajan","Vesu","Pal","Althan","Bhatar","Katargam","Udhna","Varachha","Rander","Citylight","Uttran","Sachin"], "mults": [1.50,1.40,1.20,1.30,1.10,0.90,0.80,0.75,1.00,1.60,1.15,0.70]},
    "Jaipur":      {"base": 4500,  "locs": ["Vaishali Nagar","Malviya Nagar","C Scheme","Mansarovar","Jagatpura","Pratap Nagar","Sanganer","Murlipura","Sitapura","Ajmer Road","Tonk Road","Nirman Nagar"], "mults": [1.40,1.30,1.60,1.20,1.00,0.90,0.80,0.85,0.95,0.90,1.00,1.10]},
    "Chandigarh":  {"base": 6200,  "locs": ["Sector 17","Sector 22","Sector 35","Mohali Phase 7","Zirakpur","Panchkula Sector 10","Kharar","Aerocity","New Chandigarh","Sunny Enclave","Baltana","Dhakoli"], "mults": [1.70,1.50,1.40,1.20,1.00,1.10,0.85,0.90,0.95,0.88,0.80,0.82]},
    "Kochi":       {"base": 5800,  "locs": ["Marine Drive","Panampilly Nagar","Kakkanad","Edapally","Aluva","Thrippunithura","Maradu","Vyttila","Kalamassery","Fort Kochi","Ernakulam","Palarivattom"], "mults": [1.90,1.70,1.20,1.30,1.00,1.10,1.15,1.25,1.05,1.40,1.50,1.20]},
    "Lucknow":     {"base": 4200,  "locs": ["Gomti Nagar","Hazratganj","Alambagh","Indira Nagar","Aliganj","Chinhat","Faizabad Road","Sultanpur Road","Vikas Nagar","Sector 14","Jankipuram","Mahanagar"], "mults": [1.50,1.60,1.00,1.30,1.20,0.85,0.90,0.80,0.95,1.10,1.00,1.20]},
    "Nagpur":      {"base": 4000,  "locs": ["Civil Lines","Dharampeth","Sadar","Sitabuldi","Hingna","Besa","Wardha Road","Manewada","MIHAN","Koradi Road","Ambazari","Pratap Nagar"], "mults": [1.60,1.40,1.30,1.20,0.80,0.85,0.90,0.95,1.00,0.78,1.10,1.05]},
    "Indore":      {"base": 4300,  "locs": ["Vijay Nagar","Palasia","Scheme 54","Bhawarkua","AB Road","Nipania","Rau","Banganga","Super Corridor","Scheme 78","Lasudia","Bicholi Mardana"], "mults": [1.50,1.40,1.30,1.20,1.10,1.00,0.85,0.90,1.00,0.95,0.82,0.80]},
    "Goa":         {"base": 7500,  "locs": ["Panaji","Calangute","Baga","Candolim","Panjim","Mapusa","Porvorim","Dona Paula","Bambolim","Miramar","Vasco da Gama","Margao"], "mults": [1.60,1.80,1.90,1.70,1.50,1.20,1.30,1.60,1.40,1.50,1.20,1.10]},
    "Vizag":       {"base": 4700,  "locs": ["Beach Road","MVP Colony","Rushikonda","Madhurawada","Gajuwaka","Bheemunipatnam","NAD Junction","Seethammadhara","Dwaraka Nagar","Kommadi","Pendurthi","PM Palem"], "mults": [1.80,1.50,1.40,1.20,0.90,1.00,0.95,1.30,1.20,1.10,0.85,0.92]},
    "Coimbatore":  {"base": 4600,  "locs": ["RS Puram","Gandhipuram","Saibaba Colony","Ganapathy","Peelamedu","Singanallur","Kuniyamuthur","Vadavalli","Kovaipudur","Thudiyalur","Saravanampatty","Hope College"], "mults": [1.40,1.30,1.20,1.10,1.00,0.90,0.85,1.05,0.95,0.80,1.00,1.10]},
    "Mysore":      {"base": 4100,  "locs": ["Vijayanagar","Kuvempunagar","Saraswathipuram","Hebbal","Mysore Road","Brindavan Extension","Bogadi","Bannimantap","Dattagalli","Hootagalli","Metagalli","Ring Road"], "mults": [1.30,1.20,1.40,1.10,0.90,1.00,0.85,0.95,0.88,0.80,0.82,0.92]},
    "Bhopal":      {"base": 3800,  "locs": ["MP Nagar","Arera Colony","Kolar Road","Hoshangabad Road","Ayodhya Bypass","Bawadiya Kalan","Katara Hills","Sehore Road","Bagroda","Shahpura","Govindpura","Misrod"], "mults": [1.40,1.30,1.00,1.10,0.90,0.95,0.85,0.80,0.75,1.15,0.92,0.82]},
}

PROP_TYPES  = ["Apartment","Independent House","Villa","Penthouse","Studio"]
PROP_PROBS  = [0.60, 0.20, 0.10, 0.04, 0.06]
FURNISH     = ["Unfurnished","Semi-Furnished","Fully Furnished"]
FURNISH_P   = [0.28, 0.42, 0.30]
FURNISH_MUL = {"Unfurnished": 1.00, "Semi-Furnished": 1.05, "Fully Furnished": 1.12}
PROP_MUL    = {"Apartment": 1.00, "Independent House": 1.10, "Villa": 1.35, "Penthouse": 1.60, "Studio": 0.85}
BHK_SIZE    = {1: (300,650), 2: (650,1200), 3: (1100,2000), 4: (1800,3500), 5: (2800,6000)}
AMENITY_LBL = ["has_gym","has_pool","has_security","has_power_backup","has_clubhouse","has_parking"]
AM_BONUS    = [400, 600, 200, 150, 350, 100]

cities_list = list(CITY_DATA.keys())
city_weights = [0.13,0.12,0.12,0.09,0.09,0.08,0.07,0.06,0.04,0.04,0.03,0.03,0.03,0.03,0.03,0.02,0.02,0.02,0.02,0.02]

def weighted_choice(items, weights):
    total = sum(weights)
    r = rng.random() * total
    upto = 0
    for item, w in zip(items, weights):
        upto += w
        if r <= upto:
            return item
    return items[-1]

def gen_record(record_id, created_at):
    city   = weighted_choice(cities_list, city_weights)
    cd     = CITY_DATA[city]
    idx    = rng.randint(0, len(cd["locs"]) - 1)
    loc    = cd["locs"][idx]
    mult   = cd["mults"][idx]

    bhk    = rng.choices([1,2,3,4,5], weights=[8,28,38,18,8])[0]
    sz_lo, sz_hi = BHK_SIZE[bhk]
    size   = round(rng.uniform(sz_lo, sz_hi), 0)

    ptype  = rng.choices(PROP_TYPES, weights=[60,20,10,4,6])[0]
    furn   = rng.choices(FURNISH, weights=[28,42,30])[0]
    baths  = max(1, min(bhk + rng.randint(-1,1), 8))
    balc   = rng.randint(0, min(bhk, 3))
    age    = rng.randint(0, 25)
    dist   = round(rng.uniform(0.2, 18.0), 2)

    am_prob = min(0.92, 0.25 + bhk * 0.10 + (0.20 if ptype in ["Villa","Penthouse"] else 0))
    amenities = {lbl: (rng.random() < am_prob) for lbl in AMENITY_LBL}
    am_score  = sum(int(v) for v in amenities.values())
    am_bonus  = sum(AM_BONUS[i] * int(amenities[lbl]) for i, lbl in enumerate(AMENITY_LBL)) / 6

    age_dep   = max(0.68, 1.0 - age * 0.015)
    metro_pen = max(0.78, 1.0 - dist * 0.011)

    eff_psf = (
        cd["base"] * mult
        * PROP_MUL[ptype]
        * age_dep * metro_pen
        * FURNISH_MUL[furn]
        + am_bonus
    )
    final_psf = max(800, eff_psf * rng.gauss(1.0, 0.09))
    price = round(final_psf * size, 0)
    margin = rng.uniform(0.07, 0.10)

    return {
        "id": record_id,
        "city": city, "locality": loc, "bhk": bhk,
        "size_sqft": size, "property_type": ptype, "furnishing": furn,
        "bathrooms": baths, "balconies": balc, "property_age": age,
        "distance_metro": dist, "amenity_score": am_score,
        **{k: int(v) for k, v in amenities.items()},
        "predicted_price": int(price),
        "price_per_sqft": round(final_psf, 2),
        "price_low": int(price * (1 - margin)),
        "price_high": int(price * (1 + margin)),
        "session_id": None,
        "created_at": created_at.isoformat(),
    }

print(f"Seeding {SEED_COUNT} historical records...")

now    = datetime.now()
start  = now - timedelta(days=540)  # 18 months back
records = []

for i in range(1, SEED_COUNT + 1):
    # Distribute records over 18 months with increasing frequency
    frac = (i / SEED_COUNT) ** 0.7
    ts   = start + timedelta(seconds=frac * (now - start).total_seconds())
    ts  += timedelta(seconds=rng.randint(-3600, 3600))  # jitter
    records.append(gen_record(i, ts))

    if i % 1000 == 0:
        print(f"  Generated {i}/{SEED_COUNT}...")

store = {"predictions": records, "feedback": []}
OUTPUT_FILE.write_text(json.dumps(store, indent=None))

size_mb = OUTPUT_FILE.stat().st_size / 1024 / 1024
print(f"Seeded {len(records)} records -> {OUTPUT_FILE} ({size_mb:.1f} MB)")
print("DB seeding complete!")
