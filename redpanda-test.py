from confluent_kafka import Producer, Consumer

# Producer (sending messages to Redpanda)
producer = Producer({'bootstrap.servers': 'redpanda-services:9092'})
producer.produce('my-topic', 'Hello Redpanda!')
producer.flush()

# Consumer (receiving messages from Redpanda)
consumer = Consumer({
    'bootstrap.servers': '192.168.49.2:9092',
    'group.id': 'my-group',
    'auto.offset.reset': 'earliest'
})
consumer.subscribe(['my-topic'])

while True:
    msg = consumer.poll(1.0)
    if msg is None:
        continue
    print(f"Received message: {msg.value().decode('utf-8')}")
