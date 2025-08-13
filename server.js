const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5500; // 기존에 사용하시던 포트

// 프로젝트 루트 디렉토리를 정적 파일 경로로 설정합니다.
app.use(express.static(path.join(__dirname, '/')));

// API 엔드포인트: /list-samples-content/:folderPath*
// folderPath는 선택 사항이며, 중첩된 폴더 경로를 처리할 수 있습니다.
app.get('/list-samples-content/*', (req, res) => {
    // req.params[0]은 와일드카드 (*)에 매칭되는 경로를 가져옵니다.
    const requestedPath = req.params[0] || ''; // 기본값은 빈 문자열 (samples 루트)
    const fullPath = path.join(__dirname, 'samples', requestedPath);

    fs.readdir(fullPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error(`Could not list directory ${fullPath}:`, err);
            // 폴더가 없으면 404, 다른 에러면 500
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'Directory not found' });
            } else {
                return res.status(500).json({ error: 'Server error' });
            }
        }

        const folders = [];
        const files = [];

        entries.forEach(entry => {
            if (entry.isDirectory()) {
                folders.push(entry.name);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (['.wav', '.mp3', '.ogg', '.flac', '.m4a'].includes(ext)) {
                    files.push(path.join('samples', requestedPath, entry.name).replace(/\\/g, '/')); // 웹 경로에 맞게 \를 /로 변경
                }
            }
        });

        res.json({ folders, files });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
