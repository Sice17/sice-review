ALTER TABLE transactions ALTER COLUMN token SET DEFAULT replace(replace(encode(gen_random_bytes(24), 'base64'), '+', '-'), '/', '_');
