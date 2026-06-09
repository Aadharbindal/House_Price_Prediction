"""
Realistic PAN-India Real Estate Dataset Generator.
20 cities, 15+ localities each, 100,000 records.
"""
import numpy as np
import pandas as pd
from pathlib import Path

RANDOM_STATE = 42
rng = np.random.default_rng(RANDOM_STATE)

CITY_CONFIG = {
    "Mumbai": {
        "base_psf": 22000, "weight": 0.13,
        "localities": {
            "Bandra West": 2.10, "Juhu": 2.00, "Worli": 2.20,
            "Lower Parel": 1.80, "Prabhadevi": 1.85, "Dadar": 1.50,
            "Powai": 1.30, "Andheri West": 1.20, "Andheri East": 1.00,
            "Malad West": 0.90, "Borivali West": 0.85, "Thane": 0.75,
            "Navi Mumbai": 0.70, "Mira Road": 0.60, "Vasai": 0.55,
        },
    },
    "Bangalore": {
        "base_psf": 8500, "weight": 0.12,
        "localities": {
            "Indiranagar": 1.90, "Koramangala": 1.85, "Richmond Town": 2.00,
            "Whitefield": 1.40, "HSR Layout": 1.35, "Jayanagar": 1.30,
            "JP Nagar": 1.20, "Electronic City": 0.85, "Hebbal": 1.10,
            "Sarjapur Road": 1.15, "Yelahanka": 0.80, "Kengeri": 0.70,
            "Bannerghatta Road": 1.00, "Marathahalli": 1.10, "Bellandur": 1.05,
        },
    },
    "Delhi NCR": {
        "base_psf": 12000, "weight": 0.12,
        "localities": {
            "Lutyens Delhi": 2.50, "South Delhi": 2.00, "Golf Course Road": 1.80,
            "Gurgaon Sector 29": 1.60, "DLF Phase 1": 1.70, "Vasant Kunj": 1.50,
            "Dwarka": 1.10, "Rohini": 0.90, "Noida Sector 137": 1.00,
            "Noida Extension": 0.75, "Faridabad": 0.70, "Greater Noida": 0.65,
            "Ghaziabad": 0.68, "Indirapuram": 0.80, "Raj Nagar Extension": 0.60,
        },
    },
    "Pune": {
        "base_psf": 7200, "weight": 0.09,
        "localities": {
            "Boat Club Road": 2.00, "Koregaon Park": 1.90, "Baner": 1.40,
            "Kharadi": 1.20, "Wakad": 1.10, "Hinjewadi": 1.00,
            "Hadapsar": 0.85, "Undri": 0.80, "Talegaon": 0.65,
            "Pimpri Chinchwad": 0.75, "Aundh": 1.30, "Viman Nagar": 1.25,
            "Katraj": 0.70, "Kondhwa": 0.78, "Pisoli": 0.62,
        },
    },
    "Hyderabad": {
        "base_psf": 6800, "weight": 0.09,
        "localities": {
            "Banjara Hills": 2.00, "Jubilee Hills": 1.90, "HITEC City": 1.50,
            "Gachibowli": 1.40, "Kondapur": 1.20, "Manikonda": 1.00,
            "Miyapur": 0.85, "Bachupally": 0.80, "LB Nagar": 0.75,
            "Kompally": 0.78, "Kukatpally": 0.90, "Uppal": 0.72,
            "Nallagandla": 1.10, "Nizampet": 0.82, "Shamshabad": 0.68,
        },
    },
    "Chennai": {
        "base_psf": 6500, "weight": 0.08,
        "localities": {
            "Nungambakkam": 1.90, "Adyar": 1.80, "Anna Nagar": 1.60,
            "Velachery": 1.20, "OMR": 1.00, "Porur": 0.90,
            "Tambaram": 0.75, "Sholinganallur": 1.10, "Perambur": 0.70,
            "Guindy": 1.05, "Chrompet": 0.78, "Pallavaram": 0.80,
            "Madipakkam": 0.85, "Teynampet": 1.50, "Mylapore": 1.40,
        },
    },
    "Kolkata": {
        "base_psf": 5500, "weight": 0.07,
        "localities": {
            "Alipore": 2.00, "Ballygunge": 1.80, "Park Street": 1.70,
            "Salt Lake": 1.40, "New Town": 1.30, "Rajarhat": 1.00,
            "Dumdum": 0.80, "Behala": 0.78, "Howrah": 0.75,
            "Barrackpore": 0.65, "Garia": 0.72, "Jadavpur": 1.10,
            "Tollygunge": 1.05, "Lake Town": 1.15, "Santoshpur": 0.82,
        },
    },
    "Ahmedabad": {
        "base_psf": 5200, "weight": 0.06,
        "localities": {
            "Bodakdev": 1.80, "Prahlad Nagar": 1.70, "Satellite": 1.50,
            "Vastrapur": 1.40, "Thaltej": 1.30, "SG Highway": 1.20,
            "Bopal": 1.00, "Chandkheda": 0.85, "Naroda": 0.70,
            "Nikol": 0.65, "Motera": 0.90, "Gota": 0.92,
            "Shela": 1.05, "Maninagar": 0.80, "Odhav": 0.68,
        },
    },
    "Surat": {
        "base_psf": 4800, "weight": 0.04,
        "localities": {
            "Adajan": 1.50, "Vesu": 1.40, "Pal": 1.20,
            "Althan": 1.30, "Bhatar": 1.10, "Katargam": 0.90,
            "Udhna": 0.80, "Varachha": 0.75, "Rander": 1.00,
            "Citylight": 1.60, "Uttran": 1.15, "Sachin": 0.70,
        },
    },
    "Jaipur": {
        "base_psf": 4500, "weight": 0.04,
        "localities": {
            "Vaishali Nagar": 1.40, "Malviya Nagar": 1.30, "C Scheme": 1.60,
            "Mansarovar": 1.20, "Jagatpura": 1.00, "Pratap Nagar": 0.90,
            "Sanganer": 0.80, "Murlipura": 0.85, "Sitapura": 0.95,
            "Ajmer Road": 0.90, "Tonk Road": 1.00, "Nirman Nagar": 1.10,
        },
    },
    "Lucknow": {
        "base_psf": 4200, "weight": 0.03,
        "localities": {
            "Gomti Nagar": 1.50, "Hazratganj": 1.60, "Alambagh": 1.00,
            "Indira Nagar": 1.30, "Aliganj": 1.20, "Chinhat": 0.85,
            "Faizabad Road": 0.90, "Sultanpur Road": 0.80, "Vikas Nagar": 0.95,
            "Sector 14": 1.10, "Jankipuram": 1.00, "Mahanagar": 1.20,
        },
    },
    "Kochi": {
        "base_psf": 5800, "weight": 0.03,
        "localities": {
            "Marine Drive": 1.90, "Panampilly Nagar": 1.70, "Kakkanad": 1.20,
            "Edapally": 1.30, "Aluva": 1.00, "Thrippunithura": 1.10,
            "Maradu": 1.15, "Vyttila": 1.25, "Kalamassery": 1.05,
            "Fort Kochi": 1.40, "Ernakulam": 1.50, "Palarivattom": 1.20,
        },
    },
    "Nagpur": {
        "base_psf": 4000, "weight": 0.03,
        "localities": {
            "Civil Lines": 1.60, "Dharampeth": 1.40, "Sadar": 1.30,
            "Sitabuldi": 1.20, "Hingna": 0.80, "Besa": 0.85,
            "Wardha Road": 0.90, "Manewada": 0.95, "MIHAN": 1.00,
            "Koradi Road": 0.78, "Ambazari": 1.10, "Pratap Nagar": 1.05,
        },
    },
    "Indore": {
        "base_psf": 4300, "weight": 0.03,
        "localities": {
            "Vijay Nagar": 1.50, "Palasia": 1.40, "Scheme 54": 1.30,
            "Bhawarkua": 1.20, "AB Road": 1.10, "Nipania": 1.00,
            "Rau": 0.85, "Banganga": 0.90, "Bicholi Mardana": 0.80,
            "Super Corridor": 1.00, "Scheme 78": 0.95, "Lasudia": 0.82,
        },
    },
    "Bhopal": {
        "base_psf": 3800, "weight": 0.02,
        "localities": {
            "MP Nagar": 1.40, "Arera Colony": 1.30, "Kolar Road": 1.00,
            "Hoshangabad Road": 1.10, "Ayodhya Bypass": 0.90, "Bawadiya Kalan": 0.95,
            "Katara Hills": 0.85, "Sehore Road": 0.80, "Bagroda": 0.75,
            "Shahpura": 1.15, "Govindpura": 0.92, "Misrod": 0.82,
        },
    },
    "Coimbatore": {
        "base_psf": 4600, "weight": 0.02,
        "localities": {
            "RS Puram": 1.40, "Gandhipuram": 1.30, "Saibaba Colony": 1.20,
            "Ganapathy": 1.10, "Peelamedu": 1.00, "Singanallur": 0.90,
            "Kuniyamuthur": 0.85, "Vadavalli": 1.05, "Kovaipudur": 0.95,
            "Thudiyalur": 0.80, "Saravanampatty": 1.00, "Hope College": 1.10,
        },
    },
    "Vizag": {
        "base_psf": 4700, "weight": 0.02,
        "localities": {
            "Beach Road": 1.80, "MVP Colony": 1.50, "Rushikonda": 1.40,
            "Madhurawada": 1.20, "Gajuwaka": 0.90, "Bheemunipatnam": 1.00,
            "NAD Junction": 0.95, "Seethammadhara": 1.30, "Dwaraka Nagar": 1.20,
            "Kommadi": 1.10, "Pendurthi": 0.85, "PM Palem": 0.92,
        },
    },
    "Chandigarh": {
        "base_psf": 6200, "weight": 0.03,
        "localities": {
            "Sector 17": 1.70, "Sector 22": 1.50, "Sector 35": 1.40,
            "Mohali Phase 7": 1.20, "Zirakpur": 1.00, "Panchkula Sector 10": 1.10,
            "Kharar": 0.85, "Aerocity": 0.90, "New Chandigarh": 0.95,
            "Sunny Enclave": 0.88, "Baltana": 0.80, "Dhakoli": 0.82,
        },
    },
    "Mysore": {
        "base_psf": 4100, "weight": 0.02,
        "localities": {
            "Vijayanagar": 1.30, "Kuvempunagar": 1.20, "Saraswathipuram": 1.40,
            "Hebbal": 1.10, "Mysore Road": 0.90, "Brindavan Extension": 1.00,
            "Bogadi": 0.85, "Bannimantap": 0.95, "Dattagalli": 0.88,
            "Hootagalli": 0.80, "Metagalli": 0.82, "Ring Road": 0.92,
        },
    },
    "Goa": {
        "base_psf": 7500, "weight": 0.02,
        "localities": {
            "Panaji": 1.60, "Vasco da Gama": 1.20, "Margao": 1.10,
            "Calangute": 1.80, "Baga": 1.90, "Candolim": 1.70,
            "Panjim": 1.50, "Mapusa": 1.20, "Porvorim": 1.30,
            "Dona Paula": 1.60, "Bambolim": 1.40, "Miramar": 1.50,
        },
    },
}

PROPERTY_TYPES = {
    "Apartment": 1.00, "Independent House": 1.10,
    "Villa": 1.35, "Penthouse": 1.60, "Studio": 0.85,
}
FURNISHING = {"Unfurnished": 0.00, "Semi-Furnished": 0.05, "Fully Furnished": 0.12}
BHK_SIZE = {1: (300, 650), 2: (650, 1200), 3: (1100, 2000), 4: (1800, 3500), 5: (2800, 6000)}
AMENITY_LABELS = ["has_gym", "has_pool", "has_security", "has_power_backup", "has_clubhouse", "has_parking"]
AMENITY_BONUS  = [400, 600, 200, 150, 350, 100]


def generate_dataset(n_samples: int = 100000) -> pd.DataFrame:
    cities     = list(CITY_CONFIG.keys())
    city_wts   = [CITY_CONFIG[c]["weight"] for c in cities]
    total_wt   = sum(city_wts)
    city_wts   = [w / total_wt for w in city_wts]

    records = []
    for _ in range(n_samples):
        city      = rng.choice(cities, p=city_wts)
        cfg       = CITY_CONFIG[city]
        locality  = rng.choice(list(cfg["localities"].keys()))
        loc_mult  = cfg["localities"][locality]

        bhk       = int(rng.choice([1, 2, 3, 4, 5], p=[0.08, 0.28, 0.38, 0.18, 0.08]))
        sz_lo, sz_hi = BHK_SIZE[bhk]
        size_sqft = round(float(rng.uniform(sz_lo, sz_hi)), 0)

        prop_type  = rng.choice(list(PROPERTY_TYPES.keys()), p=[0.60, 0.20, 0.10, 0.04, 0.06])
        furnishing = rng.choice(list(FURNISHING.keys()), p=[0.28, 0.42, 0.30])
        bathrooms  = max(1, int(min(bhk + rng.integers(-1, 2), 8)))
        balconies  = int(rng.integers(0, min(bhk + 1, 4)))
        prop_age   = int(rng.integers(0, 26))
        dist_metro = round(float(rng.uniform(0.2, 18.0)), 2)

        luxury = prop_type in ["Villa", "Penthouse"]
        am_prob = min(0.92, 0.25 + bhk * 0.10 + (0.20 if luxury else 0))
        amenities = {lbl: bool(rng.random() < am_prob) for lbl in AMENITY_LABELS}
        am_score  = sum(amenities.values())
        am_bonus  = sum(AMENITY_BONUS[i] * int(amenities[lbl]) for i, lbl in enumerate(AMENITY_LABELS)) / 6

        age_dep   = max(0.68, 1.0 - prop_age * 0.015)
        metro_pen = max(0.78, 1.0 - dist_metro * 0.011)

        eff_psf = (
            cfg["base_psf"] * loc_mult
            * PROPERTY_TYPES[prop_type]
            * age_dep * metro_pen
            * (1 + FURNISHING[furnishing])
            + am_bonus
        )
        noise     = rng.normal(1.0, 0.09)
        final_psf = max(800, eff_psf * noise)
        price     = final_psf * size_sqft

        records.append({
            "city": city, "locality": locality, "bhk": bhk,
            "size_sqft": size_sqft, "property_type": prop_type,
            "furnishing": furnishing, "bathrooms": bathrooms,
            "balconies": balconies, "property_age": prop_age,
            "distance_metro": dist_metro, "amenity_score": am_score,
            **amenities,
            "price": round(price, 0), "price_per_sqft": round(final_psf, 2),
        })

    df = pd.DataFrame(records)
    return df


if __name__ == "__main__":
    print("Generating 100,000 property records across 20 cities...")
    df = generate_dataset(100000)
    out = Path(__file__).parent / "data" / "dataset.csv"
    out.parent.mkdir(exist_ok=True)
    df.to_csv(out, index=False)
    print(f"Saved {len(df)} records to {out}")
    print(f"Cities: {df['city'].nunique()}, Localities: {df['locality'].nunique()}")
    print(f"Price: Rs.{df['price'].min()/1e5:.1f}L - Rs.{df['price'].max()/1e7:.2f}Cr")
