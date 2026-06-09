/**
 * PAN-India City & Locality Configuration
 * Mirrors the Python dataset_gen.py config for consistent API responses.
 * Updated to match the new 20 cities and their localities.
 */
const CITY_CONFIG = {
  "Mumbai": {
    "base_psf": 22000,
    "market_trend": "Stable",
    "localities": {
      "Bandra West": { "mult": 2.10, "tier": "Premium" },
      "Juhu": { "mult": 2.00, "tier": "Premium" },
      "Worli": { "mult": 2.20, "tier": "Premium" },
      "Lower Parel": { "mult": 1.80, "tier": "Premium" },
      "Prabhadevi": { "mult": 1.85, "tier": "Premium" },
      "Dadar": { "mult": 1.50, "tier": "Mid" },
      "Powai": { "mult": 1.30, "tier": "Mid" },
      "Andheri West": { "mult": 1.20, "tier": "Mid" },
      "Andheri East": { "mult": 1.00, "tier": "Mid" },
      "Malad West": { "mult": 0.90, "tier": "Budget" },
      "Borivali West": { "mult": 0.85, "tier": "Budget" },
      "Thane": { "mult": 0.75, "tier": "Budget" },
      "Navi Mumbai": { "mult": 0.70, "tier": "Budget" },
      "Mira Road": { "mult": 0.60, "tier": "Budget" },
      "Vasai": { "mult": 0.55, "tier": "Budget" }
    }
  },
  "Bangalore": {
    "base_psf": 8500,
    "market_trend": "Rising",
    "localities": {
      "Richmond Town": { "mult": 2.00, "tier": "Premium" },
      "Indiranagar": { "mult": 1.90, "tier": "Premium" },
      "Koramangala": { "mult": 1.85, "tier": "Premium" },
      "Whitefield": { "mult": 1.40, "tier": "Mid" },
      "HSR Layout": { "mult": 1.35, "tier": "Mid" },
      "Jayanagar": { "mult": 1.30, "tier": "Mid" },
      "JP Nagar": { "mult": 1.20, "tier": "Mid" },
      "Hebbal": { "mult": 1.10, "tier": "Mid" },
      "Sarjapur Road": { "mult": 1.15, "tier": "Mid" },
      "Marathahalli": { "mult": 1.10, "tier": "Mid" },
      "Bellandur": { "mult": 1.05, "tier": "Mid" },
      "Bannerghatta Road": { "mult": 1.00, "tier": "Mid" },
      "Electronic City": { "mult": 0.85, "tier": "Budget" },
      "Yelahanka": { "mult": 0.80, "tier": "Budget" },
      "Kengeri": { "mult": 0.70, "tier": "Budget" }
    }
  },
  "Delhi NCR": {
    "base_psf": 12000,
    "market_trend": "Stable",
    "localities": {
      "Lutyens Delhi": { "mult": 2.50, "tier": "Premium" },
      "South Delhi": { "mult": 2.00, "tier": "Premium" },
      "Golf Course Road": { "mult": 1.80, "tier": "Premium" },
      "DLF Phase 1": { "mult": 1.70, "tier": "Premium" },
      "Gurgaon Sector 29": { "mult": 1.60, "tier": "Premium" },
      "Vasant Kunj": { "mult": 1.50, "tier": "Mid" },
      "Dwarka": { "mult": 1.10, "tier": "Mid" },
      "Noida Sector 137": { "mult": 1.00, "tier": "Mid" },
      "Rohini": { "mult": 0.90, "tier": "Budget" },
      "Indirapuram": { "mult": 0.80, "tier": "Mid" },
      "Noida Extension": { "mult": 0.75, "tier": "Budget" },
      "Faridabad": { "mult": 0.70, "tier": "Budget" },
      "Ghaziabad": { "mult": 0.68, "tier": "Budget" },
      "Greater Noida": { "mult": 0.65, "tier": "Budget" },
      "Raj Nagar Extension": { "mult": 0.60, "tier": "Budget" }
    }
  },
  "Pune": {
    "base_psf": 7200,
    "market_trend": "Rising",
    "localities": {
      "Boat Club Road": { "mult": 2.00, "tier": "Premium" },
      "Koregaon Park": { "mult": 1.90, "tier": "Premium" },
      "Baner": { "mult": 1.40, "tier": "Mid" },
      "Aundh": { "mult": 1.30, "tier": "Mid" },
      "Viman Nagar": { "mult": 1.25, "tier": "Mid" },
      "Kharadi": { "mult": 1.20, "tier": "Mid" },
      "Wakad": { "mult": 1.10, "tier": "Mid" },
      "Hinjewadi": { "mult": 1.00, "tier": "Mid" },
      "Hadapsar": { "mult": 0.85, "tier": "Budget" },
      "Undri": { "mult": 0.80, "tier": "Budget" },
      "Kondhwa": { "mult": 0.78, "tier": "Budget" },
      "Pimpri Chinchwad": { "mult": 0.75, "tier": "Budget" },
      "Katraj": { "mult": 0.70, "tier": "Budget" },
      "Talegaon": { "mult": 0.65, "tier": "Budget" },
      "Pisoli": { "mult": 0.62, "tier": "Budget" }
    }
  },
  "Hyderabad": {
    "base_psf": 6800,
    "market_trend": "Rising",
    "localities": {
      "Banjara Hills": { "mult": 2.00, "tier": "Premium" },
      "Jubilee Hills": { "mult": 1.90, "tier": "Premium" },
      "HITEC City": { "mult": 1.50, "tier": "Mid" },
      "Gachibowli": { "mult": 1.40, "tier": "Mid" },
      "Kondapur": { "mult": 1.20, "tier": "Mid" },
      "Nallagandla": { "mult": 1.10, "tier": "Mid" },
      "Manikonda": { "mult": 1.00, "tier": "Mid" },
      "Kukatpally": { "mult": 0.90, "tier": "Mid" },
      "Miyapur": { "mult": 0.85, "tier": "Budget" },
      "Nizampet": { "mult": 0.82, "tier": "Budget" },
      "Bachupally": { "mult": 0.80, "tier": "Budget" },
      "Kompally": { "mult": 0.78, "tier": "Budget" },
      "LB Nagar": { "mult": 0.75, "tier": "Budget" },
      "Uppal": { "mult": 0.72, "tier": "Budget" },
      "Shamshabad": { "mult": 0.68, "tier": "Budget" }
    }
  },
  "Chennai": {
    "base_psf": 6500,
    "market_trend": "Stable",
    "localities": {
      "Nungambakkam": { "mult": 1.90, "tier": "Premium" },
      "Adyar": { "mult": 1.80, "tier": "Premium" },
      "Anna Nagar": { "mult": 1.60, "tier": "Premium" },
      "Teynampet": { "mult": 1.50, "tier": "Premium" },
      "Mylapore": { "mult": 1.40, "tier": "Premium" },
      "Velachery": { "mult": 1.20, "tier": "Mid" },
      "Sholinganallur": { "mult": 1.10, "tier": "Mid" },
      "Guindy": { "mult": 1.05, "tier": "Mid" },
      "OMR": { "mult": 1.00, "tier": "Mid" },
      "Porur": { "mult": 0.90, "tier": "Budget" },
      "Madipakkam": { "mult": 0.85, "tier": "Mid" },
      "Pallavaram": { "mult": 0.80, "tier": "Budget" },
      "Chrompet": { "mult": 0.78, "tier": "Budget" },
      "Tambaram": { "mult": 0.75, "tier": "Budget" },
      "Perambur": { "mult": 0.70, "tier": "Budget" }
    }
  },
  "Kolkata": {
    "base_psf": 5500,
    "market_trend": "Stable",
    "localities": {
      "Alipore": { "mult": 2.00, "tier": "Premium" },
      "Ballygunge": { "mult": 1.80, "tier": "Premium" },
      "Park Street": { "mult": 1.70, "tier": "Premium" },
      "Lake Town": { "mult": 1.15, "tier": "Mid" },
      "Salt Lake": { "mult": 1.40, "tier": "Mid" },
      "New Town": { "mult": 1.30, "tier": "Mid" },
      "Jadavpur": { "mult": 1.10, "tier": "Mid" },
      "Tollygunge": { "mult": 1.05, "tier": "Mid" },
      "Rajarhat": { "mult": 1.00, "tier": "Mid" },
      "Santoshpur": { "mult": 0.82, "tier": "Budget" },
      "Dumdum": { "mult": 0.80, "tier": "Budget" },
      "Behala": { "mult": 0.78, "tier": "Budget" },
      "Howrah": { "mult": 0.75, "tier": "Budget" },
      "Garia": { "mult": 0.72, "tier": "Budget" },
      "Barrackpore": { "mult": 0.65, "tier": "Budget" }
    }
  },
  "Ahmedabad": {
    "base_psf": 5200,
    "market_trend": "Stable",
    "localities": {
      "Bodakdev": { "mult": 1.80, "tier": "Premium" },
      "Prahlad Nagar": { "mult": 1.70, "tier": "Premium" },
      "Satellite": { "mult": 1.50, "tier": "Mid" },
      "Vastrapur": { "mult": 1.40, "tier": "Mid" },
      "Thaltej": { "mult": 1.30, "tier": "Mid" },
      "SG Highway": { "mult": 1.20, "tier": "Mid" },
      "Shela": { "mult": 1.05, "tier": "Mid" },
      "Bopal": { "mult": 1.00, "tier": "Mid" },
      "Gota": { "mult": 0.92, "tier": "Mid" },
      "Motera": { "mult": 0.90, "tier": "Mid" },
      "Chandkheda": { "mult": 0.85, "tier": "Budget" },
      "Maninagar": { "mult": 0.80, "tier": "Budget" },
      "Naroda": { "mult": 0.70, "tier": "Budget" },
      "Odhav": { "mult": 0.68, "tier": "Budget" },
      "Nikol": { "mult": 0.65, "tier": "Budget" }
    }
  },
  "Surat": {
    "base_psf": 4800,
    "market_trend": "Stable",
    "localities": {
      "Citylight": { "mult": 1.60, "tier": "Premium" },
      "Adajan": { "mult": 1.50, "tier": "Premium" },
      "Vesu": { "mult": 1.40, "tier": "Mid" },
      "Althan": { "mult": 1.30, "tier": "Mid" },
      "Pal": { "mult": 1.20, "tier": "Mid" },
      "Uttran": { "mult": 1.15, "tier": "Mid" },
      "Bhatar": { "mult": 1.10, "tier": "Mid" },
      "Rander": { "mult": 1.00, "tier": "Mid" },
      "Katargam": { "mult": 0.90, "tier": "Budget" },
      "Udhna": { "mult": 0.80, "tier": "Budget" },
      "Varachha": { "mult": 0.75, "tier": "Budget" },
      "Sachin": { "mult": 0.70, "tier": "Budget" }
    }
  },
  "Jaipur": {
    "base_psf": 4500,
    "market_trend": "Stable",
    "localities": {
      "C Scheme": { "mult": 1.60, "tier": "Premium" },
      "Vaishali Nagar": { "mult": 1.40, "tier": "Premium" },
      "Malviya Nagar": { "mult": 1.30, "tier": "Mid" },
      "Mansarovar": { "mult": 1.20, "tier": "Mid" },
      "Nirman Nagar": { "mult": 1.10, "tier": "Mid" },
      "Jagatpura": { "mult": 1.00, "tier": "Mid" },
      "Tonk Road": { "mult": 1.00, "tier": "Mid" },
      "Sitapura": { "mult": 0.95, "tier": "Budget" },
      "Pratap Nagar": { "mult": 0.90, "tier": "Budget" },
      "Ajmer Road": { "mult": 0.90, "tier": "Budget" },
      "Murlipura": { "mult": 0.85, "tier": "Budget" },
      "Sanganer": { "mult": 0.80, "tier": "Budget" }
    }
  },
  "Lucknow": {
    "base_psf": 4200,
    "market_trend": "Stable",
    "localities": {
      "Hazratganj": { "mult": 1.60, "tier": "Premium" },
      "Gomti Nagar": { "mult": 1.50, "tier": "Premium" },
      "Indira Nagar": { "mult": 1.30, "tier": "Mid" },
      "Aliganj": { "mult": 1.20, "tier": "Mid" },
      "Mahanagar": { "mult": 1.20, "tier": "Mid" },
      "Sector 14": { "mult": 1.10, "tier": "Mid" },
      "Alambagh": { "mult": 1.00, "tier": "Mid" },
      "Jankipuram": { "mult": 1.00, "tier": "Mid" },
      "Vikas Nagar": { "mult": 0.95, "tier": "Budget" },
      "Faizabad Road": { "mult": 0.90, "tier": "Budget" },
      "Chinhat": { "mult": 0.85, "tier": "Budget" },
      "Sultanpur Road": { "mult": 0.80, "tier": "Budget" }
    }
  },
  "Kochi": {
    "base_psf": 5800,
    "market_trend": "Stable",
    "localities": {
      "Marine Drive": { "mult": 1.90, "tier": "Premium" },
      "Panampilly Nagar": { "mult": 1.70, "tier": "Premium" },
      "Ernakulam": { "mult": 1.50, "tier": "Premium" },
      "Fort Kochi": { "mult": 1.40, "tier": "Mid" },
      "Edapally": { "mult": 1.30, "tier": "Mid" },
      "Vyttila": { "mult": 1.25, "tier": "Mid" },
      "Kakkanad": { "mult": 1.20, "tier": "Mid" },
      "Palarivattom": { "mult": 1.20, "tier": "Mid" },
      "Maradu": { "mult": 1.15, "tier": "Mid" },
      "Thrippunithura": { "mult": 1.10, "tier": "Mid" },
      "Kalamassery": { "mult": 1.05, "tier": "Budget" },
      "Aluva": { "mult": 1.00, "tier": "Budget" }
    }
  },
  "Nagpur": {
    "base_psf": 4000,
    "market_trend": "Stable",
    "localities": {
      "Civil Lines": { "mult": 1.60, "tier": "Premium" },
      "Dharampeth": { "mult": 1.40, "tier": "Premium" },
      "Sadar": { "mult": 1.30, "tier": "Mid" },
      "Sitabuldi": { "mult": 1.20, "tier": "Mid" },
      "Ambazari": { "mult": 1.10, "tier": "Mid" },
      "Pratap Nagar": { "mult": 1.05, "tier": "Mid" },
      "MIHAN": { "mult": 1.00, "tier": "Mid" },
      "Manewada": { "mult": 0.95, "tier": "Budget" },
      "Wardha Road": { "mult": 0.90, "tier": "Budget" },
      "Besa": { "mult": 0.85, "tier": "Budget" },
      "Hingna": { "mult": 0.80, "tier": "Budget" },
      "Koradi Road": { "mult": 0.78, "tier": "Budget" }
    }
  },
  "Indore": {
    "base_psf": 4300,
    "market_trend": "Stable",
    "localities": {
      "Vijay Nagar": { "mult": 1.50, "tier": "Premium" },
      "Palasia": { "mult": 1.40, "tier": "Premium" },
      "Scheme 54": { "mult": 1.30, "tier": "Mid" },
      "Bhawarkua": { "mult": 1.20, "tier": "Mid" },
      "AB Road": { "mult": 1.10, "tier": "Mid" },
      "Nipania": { "mult": 1.00, "tier": "Mid" },
      "Super Corridor": { "mult": 1.00, "tier": "Mid" },
      "Scheme 78": { "mult": 0.95, "tier": "Budget" },
      "Banganga": { "mult": 0.90, "tier": "Budget" },
      "Rau": { "mult": 0.85, "tier": "Budget" },
      "Lasudia": { "mult": 0.82, "tier": "Budget" },
      "Bicholi Mardana": { "mult": 0.80, "tier": "Budget" }
    }
  },
  "Bhopal": {
    "base_psf": 3800,
    "market_trend": "Stable",
    "localities": {
      "MP Nagar": { "mult": 1.40, "tier": "Premium" },
      "Arera Colony": { "mult": 1.30, "tier": "Premium" },
      "Shahpura": { "mult": 1.15, "tier": "Mid" },
      "Hoshangabad Road": { "mult": 1.10, "tier": "Mid" },
      "Kolar Road": { "mult": 1.00, "tier": "Mid" },
      "Bawadiya Kalan": { "mult": 0.95, "tier": "Mid" },
      "Govindpura": { "mult": 0.92, "tier": "Budget" },
      "Ayodhya Bypass": { "mult": 0.90, "tier": "Budget" },
      "Katara Hills": { "mult": 0.85, "tier": "Budget" },
      "Misrod": { "mult": 0.82, "tier": "Budget" },
      "Sehore Road": { "mult": 0.80, "tier": "Budget" },
      "Bagroda": { "mult": 0.75, "tier": "Budget" }
    }
  },
  "Coimbatore": {
    "base_psf": 4600,
    "market_trend": "Stable",
    "localities": {
      "RS Puram": { "mult": 1.40, "tier": "Premium" },
      "Gandhipuram": { "mult": 1.30, "tier": "Premium" },
      "Saibaba Colony": { "mult": 1.20, "tier": "Mid" },
      "Peelamedu": { "mult": 1.00, "tier": "Mid" },
      "Ganapathy": { "mult": 1.10, "tier": "Mid" },
      "Hope College": { "mult": 1.10, "tier": "Mid" },
      "Vadavalli": { "mult": 1.05, "tier": "Mid" },
      "Saravanampatty": { "mult": 1.00, "tier": "Mid" },
      "Kovaipudur": { "mult": 0.95, "tier": "Budget" },
      "Singanallur": { "mult": 0.90, "tier": "Budget" },
      "Kuniyamuthur": { "mult": 0.85, "tier": "Budget" },
      "Thudiyalur": { "mult": 0.80, "tier": "Budget" }
    }
  },
  "Vizag": {
    "base_psf": 4700,
    "market_trend": "Stable",
    "localities": {
      "Beach Road": { "mult": 1.80, "tier": "Premium" },
      "MVP Colony": { "mult": 1.50, "tier": "Premium" },
      "Rushikonda": { "mult": 1.40, "tier": "Mid" },
      "Seethammadhara": { "mult": 1.30, "tier": "Mid" },
      "Dwaraka Nagar": { "mult": 1.20, "tier": "Mid" },
      "Madhurawada": { "mult": 1.20, "tier": "Mid" },
      "Kommadi": { "mult": 1.10, "tier": "Mid" },
      "NAD Junction": { "mult": 0.95, "tier": "Budget" },
      "PM Palem": { "mult": 0.92, "tier": "Budget" },
      "Gajuwaka": { "mult": 0.90, "tier": "Budget" },
      "Bheemunipatnam": { "mult": 1.00, "tier": "Mid" },
      "Pendurthi": { "mult": 0.85, "tier": "Budget" }
    }
  },
  "Chandigarh": {
    "base_psf": 6200,
    "market_trend": "Stable",
    "localities": {
      "Sector 17": { "mult": 1.70, "tier": "Premium" },
      "Sector 22": { "mult": 1.50, "tier": "Premium" },
      "Sector 35": { "mult": 1.40, "tier": "Mid" },
      "Mohali Phase 7": { "mult": 1.20, "tier": "Mid" },
      "Panchkula Sector 10": { "mult": 1.10, "tier": "Mid" },
      "Zirakpur": { "mult": 1.00, "tier": "Mid" },
      "New Chandigarh": { "mult": 0.95, "tier": "Budget" },
      "Aerocity": { "mult": 0.90, "tier": "Budget" },
      "Sunny Enclave": { "mult": 0.88, "tier": "Budget" },
      "Kharar": { "mult": 0.85, "tier": "Budget" },
      "Dhakoli": { "mult": 0.82, "tier": "Budget" },
      "Baltana": { "mult": 0.80, "tier": "Budget" }
    }
  },
  "Mysore": {
    "base_psf": 4100,
    "market_trend": "Stable",
    "localities": {
      "Saraswathipuram": { "mult": 1.40, "tier": "Premium" },
      "Vijayanagar": { "mult": 1.30, "tier": "Premium" },
      "Kuvempunagar": { "mult": 1.20, "tier": "Mid" },
      "Hebbal": { "mult": 1.10, "tier": "Mid" },
      "Brindavan Extension": { "mult": 1.00, "tier": "Mid" },
      "Bannimantap": { "mult": 0.95, "tier": "Budget" },
      "Ring Road": { "mult": 0.92, "tier": "Budget" },
      "Mysore Road": { "mult": 0.90, "tier": "Budget" },
      "Dattagalli": { "mult": 0.88, "tier": "Budget" },
      "Bogadi": { "mult": 0.85, "tier": "Budget" },
      "Metagalli": { "mult": 0.82, "tier": "Budget" },
      "Hootagalli": { "mult": 0.80, "tier": "Budget" }
    }
  },
  "Goa": {
    "base_psf": 7500,
    "market_trend": "Stable",
    "localities": {
      "Baga": { "mult": 1.90, "tier": "Premium" },
      "Calangute": { "mult": 1.80, "tier": "Premium" },
      "Candolim": { "mult": 1.70, "tier": "Premium" },
      "Panaji": { "mult": 1.60, "tier": "Premium" },
      "Dona Paula": { "mult": 1.60, "tier": "Premium" },
      "Panjim": { "mult": 1.50, "tier": "Premium" },
      "Miramar": { "mult": 1.50, "tier": "Premium" },
      "Bambolim": { "mult": 1.40, "tier": "Mid" },
      "Porvorim": { "mult": 1.30, "tier": "Mid" },
      "Mapusa": { "mult": 1.20, "tier": "Mid" },
      "Vasco da Gama": { "mult": 1.20, "tier": "Mid" }
    }
  }
};

module.exports = CITY_CONFIG;
