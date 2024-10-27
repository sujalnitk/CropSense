import ee
import requests
from PIL import Image
import numpy as np
from datetime import datetime

class NDVICalculator:
    def __init__(self):
        """Initialize Earth Engine"""
        ee.Initialize()

    def calculate_ndvi(self, aoi, start_date, end_date):
        """
        Calculate NDVI values for a given area of interest
        
        Parameters:
        - aoi: ee.Geometry, the area of interest
        - start_date: str, start date in YYYY-MM-DD format
        - end_date: str, end date in YYYY-MM-DD format
        
        Returns:
        - dict with NDVI analysis results
        """
        # Calculate NDVI
        ndvi_collection = ee.ImageCollection("COPERNICUS/S2") \
            .filterBounds(aoi) \
            .filterDate(start_date, end_date) \
            .map(lambda image: image.normalizedDifference(['B8', 'B4']).rename('NDVI'))
        
        ndvi_mean = ndvi_collection.mean().select('NDVI')
        
        # Get NDVI statistics
        ndvi_stats = ndvi_mean.reduceRegion(
            reducer=ee.Reducer.mean().combine(
                ee.Reducer.minMax(), "", True
            ),
            geometry=aoi,
            scale=10,
            maxPixels=1e9
        ).getInfo()
        
        # Calculate area statistics
        healthy_veg = ndvi_mean.gte(0.3).multiply(ee.Image.pixelArea())
        bare_soil = ndvi_mean.lt(0.3).multiply(ee.Image.pixelArea())
        
        area_stats = ee.Dictionary({
            'healthy_vegetation_area': healthy_veg.reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=aoi,
                scale=10,
                maxPixels=1e9
            ),
            'bare_soil_area': bare_soil.reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=aoi,
                scale=10,
                maxPixels=1e9
            )
        }).getInfo()
        
        # Prepare results
        results = {
            'timestamp': datetime.now().isoformat(),
            'mean_ndvi': ndvi_stats.get('NDVI_mean', 0),
            'max_ndvi': ndvi_stats.get('NDVI_max', 0),
            'min_ndvi': ndvi_stats.get('NDVI_min', 0),
            'healthy_vegetation_area_m2': area_stats['healthy_vegetation_area'].get('area', 0),
            'bare_soil_area_m2': area_stats['bare_soil_area'].get('area', 0),
            'aoi': aoi.getInfo()
        }
        
        return results