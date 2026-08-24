<?php
$pdo = new PDO("mysql:host=127.0.0.1;dbname=affiliate_site", "fluxpick", "fluxpick42");
$niches = $pdo->query("SELECT id, name, slug FROM niches WHERE is_active = 1 ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
echo "=== NICHES ===\n";
foreach ($niches as $n) {
    echo $n["id"] . " | " . $n["name"] . " | " . $n["slug"] . "\n";
}
echo "\n=== RECENT 5 PUBLISHED POSTS ===\n";
$posts = $pdo->query("SELECT id, title, type, status, niche_id, published_at FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
foreach ($posts as $p) {
    echo "#" . $p["id"] . " | " . mb_substr($p["title"],0,60) . " | " . $p["type"] . " | niche=" . $p["niche_id"] . " | " . $p["published_at"] . "\n";
}
echo "\n=== SAMPLE POST CONTENT (first 500 chars) ===\n";
$sample = $pdo->query("SELECT id, title, content FROM posts WHERE status = 'published' AND content IS NOT NULL AND content != '' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if ($sample) {
    echo "Post #" . $sample["id"] . ": " . $sample["title"] . "\n";
    echo mb_substr($sample["content"], 0, 500) . "\n...\n";
}
