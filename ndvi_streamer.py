from confluent_kafka import Producer
import json
import time
import logging
from datetime import datetime, timedelta
import ee
from ndvi_calculator import NDVICalculator

class NDVIStreamer:
    def __init__(self, redpanda_config):
        """
        Initialize the NDVI streaming service
        
        Parameters:
        - redpanda_config: dict with Redpanda configuration
        """
        self.producer = Producer(redpanda_config)
        self.topic = redpanda_config.get('topic', 'ndvi-values')
        self.calculator = NDVICalculator()
        
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def delivery_report(self, err, msg):
        """Callback for message delivery reports"""
        if err is not None:
            self.logger.error(f'Message delivery failed: {err}')
        else:
            self.logger.info(f'Message delivered to {msg.topic()} [{msg.partition()}]')

    def stream_ndvi(self, aoi, interval_minutes=60):
        """
        Stream NDVI values to Redpanda
        
        Parameters:
        - aoi: ee.Geometry object defining area of interest
        - interval_minutes: int, frequency of NDVI calculations
        """
        while True:
            try:
                # Calculate time window
                end_date = datetime.now()
                start_date = end_date - timedelta(days=5)  # Using 5-day window for better cloud-free imagery
                
                # Calculate NDVI
                ndvi_results = self.calculator.calculate_ndvi(
                    aoi,
                    start_date.strftime('%Y-%m-%d'),
                    end_date.strftime('%Y-%m-%d')
                )
                
                # Send to Redpanda
                self.producer.produce(
                    self.topic,
                    key=str(datetime.now().timestamp()),
                    value=json.dumps(ndvi_results),
                    callback=self.delivery_report
                )
                self.producer.flush()
                
                self.logger.info(f"Streamed NDVI values: Mean={ndvi_results['mean_ndvi']:.3f}")
                
                # Wait for next interval
                time.sleep(interval_minutes * 60)
                
            except Exception as e:
                self.logger.error(f"Error in NDVI streaming: {str(e)}")
                time.sleep(60)  # Wait a minute before retrying

# Example usage
if __name__ == "__main__":
    # Redpanda configuration
    redpanda_config = {
        'bootstrap.servers': 'localhost:9092',
        'client.id': 'ndvi-streamer'
    }
    
    # Define area of interest (example coordinates - replace with your AOI)
    aoi = ee.Geometry.Rectangle([73.856255, 15.299326, 74.006255, 15.449326])
    
    # Initialize and run streamer
    streamer = NDVIStreamer(redpanda_config)
    streamer.stream_ndvi(aoi, interval_minutes=60)