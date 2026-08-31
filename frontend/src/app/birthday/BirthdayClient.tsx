'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './birthday.module.css';
import { DEFAULT_PHOTOS, buildDefaultWishes, BIRTHDAY_AUDIO_SRC } from './birthday.config ';

type Props = {
    date: string; // "dd-mm-yyyy" hoặc rỗng
    name: string;
    photos: string[]; // truyền từ query ?p=... (có thể rỗng)
    message: string; // truyền từ query ?m=... (có thể rỗng)
};

// Chuyển link chia sẻ Google Drive thành link ảnh hiển thị trực tiếp được.
// Hỗ trợ dạng: .../file/d/<id>/view..., ...?id=<id>, .../open?id=<id>
function resolveImageSrc(src: string): string {
    if (!src.includes('drive.google.com')) return src;
    const match = src.match(/\/file\/d\/([^/]+)/) || src.match(/[?&]id=([^&]+)/);
    const fileId = match?.[1];
    if (!fileId) return src;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

// ================================================================

const CONFETTI_COLORS = ['#ff6b9d', '#ffd166', '#06d6a0', '#4cc9f0', '#c77dff', '#ff9f68'];
const BOKEH_COLORS = ['#ff8fd8', '#8fd9ff', '#ffe28f', '#b48fff'];
const FLOWER_EMOJIS = ['🌸', '🌷', '💮', '✨'];

// Vị trí cố định (không dùng Math.random ở lần render đầu) để tránh lệch giữa server/client
const BOKEH_PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
    left: (i * 37) % 100,
    top: (i * 53) % 90,
    size: 6 + (i % 5) * 2,
    duration: 6 + (i % 6),
    delay: -((i % 5) * 1.3),
    color: BOKEH_COLORS[i % BOKEH_COLORS.length],
}));

const FLOWER_PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
    left: (i * 41) % 100,
    duration: 9 + (i % 5) * 1.8,
    delay: -((i % 7) * 1.1),
    emoji: FLOWER_EMOJIS[i % FLOWER_EMOJIS.length],
}));

type ConfettiPiece = {
    id: number;
    left: number;
    color: string;
    delay: number;
    duration: number;
    rotate: number;
};

function getAge(dateStr: string): number | null {
    if (!dateStr) return null;
    const [d, m, y] = dateStr.split('-').map(Number);
    if (!d || !m || !y) return null;
    const birth = new Date(y, m - 1, d);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const hadBirthdayThisYear =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
    if (!hadBirthdayThisYear) age -= 1;

    return age >= 0 ? age : null;
}

export default function BirthdayClient({ date, name, photos, message }: Props) {
    const [blown, setBlown] = useState(false);
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
    const [failedPhotos, setFailedPhotos] = useState<Set<number>>(new Set());
    const audioRef = useRef<HTMLAudioElement>(null);
    const hasPlayedRef = useRef(false);

    const age = useMemo(() => getAge(date), [date]);
    const digits = age !== null ? String(age).split('') : [];

    // Ưu tiên ảnh truyền qua ?p=, không có thì dùng danh sách mặc định trong birthday.config.ts
    const galleryPhotos = photos.length > 0 ? photos : DEFAULT_PHOTOS;

    // Lời chúc: ?m= ghi đè nếu có, không thì random 1 câu trong bộ mặc định — chỉ random 1 lần khi trang load
    const [randomWish] = useState(() => {
        const pool = buildDefaultWishes(name);
        return pool[Math.floor(Math.random() * pool.length)];
    });
    const finalMessage = message || randomWish;

    function playAudioOnce() {
        if (hasPlayedRef.current) return;
        hasPlayedRef.current = true;
        audioRef.current?.play().catch(() => {
            // Trình duyệt chặn autoplay hoặc chưa có file /public/hpbd.mp3 — bỏ qua, không chặn trải nghiệm
        });
    }

    function handleBlow() {
        playAudioOnce();
        if (blown) return;
        setBlown(true);

        const pieces: ConfettiPiece[] = Array.from({ length: 46 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            delay: Math.random() * 0.6,
            duration: 2.6 + Math.random() * 1.8,
            rotate: Math.random() * 360,
        }));
        setConfetti(pieces);
    }

    return (
        <div className={styles.wrapper} onClick={playAudioOnce}>
            <audio ref={audioRef} preload="none">
                <source src={BIRTHDAY_AUDIO_SRC} type="audio/mpeg" />
            </audio>

            {/* Đèn bokeh nền */}
            <div className={styles.bgLayer} aria-hidden="true">
                {BOKEH_PARTICLES.map((p, i) => (
                    <span
                        key={i}
                        className={styles.bokeh}
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            width: p.size,
                            height: p.size,
                            background: p.color,
                            animationDuration: `${p.duration}s`,
                            animationDelay: `${p.delay}s`,
                        }}
                    />
                ))}
            </div>

            {/* Hoa rơi */}
            <div className={styles.flowerLayer} aria-hidden="true">
                {FLOWER_PARTICLES.map((f, i) => (
                    <span
                        key={i}
                        className={styles.flower}
                        style={{
                            left: `${f.left}%`,
                            animationDuration: `${f.duration}s`,
                            animationDelay: `${f.delay}s`,
                        }}
                    >
                        {f.emoji}
                    </span>
                ))}
            </div>

            {/* Pháo giấy — chỉ xuất hiện sau khi thổi nến */}
            {confetti.length > 0 && (
                <div className={styles.confettiLayer} aria-hidden="true">
                    {confetti.map((c) => (
                        <span
                            key={c.id}
                            className={styles.confettiPiece}
                            style={
                                {
                                    left: `${c.left}%`,
                                    background: c.color,
                                    animationDelay: `${c.delay}s`,
                                    animationDuration: `${c.duration}s`,
                                    '--rotate': `${c.rotate}deg`,
                                } as React.CSSProperties
                            }
                        />
                    ))}
                </div>
            )}

            <div className={styles.content}>
                <p className={styles.eyebrow}>🎂 Thiệp sinh nhật gửi đến</p>
                <h1 className={styles.title}>{name}</h1>
                {date && <p className={styles.dateLabel}>{date}</p>}
                <p className={styles.subtitle}>Chúc Mừng Sinh Nhật</p>

                {/* Ảnh kỷ niệm treo kiểu polaroid */}
                <div className={styles.photoString}>
                    {(galleryPhotos.length > 0 ? galleryPhotos : [null, null, null]).map((src, i) => {
                        const tilt = (i % 2 === 0 ? -1 : 1) * (4 + (i % 3) * 2);
                        const showPlaceholder = !src || failedPhotos.has(i);
                        return (
                            <motion.div
                                key={i}
                                className={styles.photoFrame}
                                initial={{ opacity: 0, y: -30, rotate: 0 }}
                                animate={{ opacity: 1, y: 0, rotate: tilt }}
                                whileHover={{ scale: 1.06, rotate: 0 }}
                                transition={{ delay: 0.15 * i, duration: 0.55, ease: 'easeOut' }}
                            >
                                <span className={styles.photoTape} />
                                {showPlaceholder ? (
                                    <div className={styles.photoPlaceholder}>📷</div>
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={resolveImageSrc(src as string)}
                                        alt={`Ảnh kỷ niệm ${i + 1}`}
                                        className={styles.photoImg}
                                        onError={() => setFailedPhotos((prev) => new Set(prev).add(i))}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
                {galleryPhotos.length === 0 && (
                    <p className={styles.photoHint}>
                        Thêm ảnh: sửa mảng <code>DEFAULT_PHOTOS</code> trong <code>birthday.config.ts</code> (đường dẫn trong{' '}
                        <code>public/birthday</code> hoặc link chia sẻ Google Drive), hoặc truyền qua <code>?p=</code>
                    </p>
                )}

                {/* Sân khấu bánh kem */}
                <div className={styles.cakeStage}>
                    <button
                        type="button"
                        className={styles.cakeButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleBlow();
                        }}
                        aria-pressed={blown}
                        aria-label={blown ? 'Nến đã tắt' : 'Chạm để thổi nến'}
                    >
                        <div className={styles.candlesRow}>
                            {(digits.length > 0 ? digits : ['🎈', '🎈', '🎈']).map((d, i) => (
                                <div key={i} className={styles.candle}>
                                    <span className={`${styles.flame} ${blown ? styles.flameOff : ''}`} />
                                    <span className={styles.candleStick}>{digits.length > 0 ? d : ''}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.cake}>
                            <div className={styles.tierTop} />
                            <div className={styles.tierMiddle}>
                                {CONFETTI_COLORS.slice(0, 6).map((c, i) => (
                                    <span
                                        key={i}
                                        className={styles.sprinkle}
                                        style={{ left: `${8 + i * 15}%`, background: c }}
                                    />
                                ))}
                            </div>
                            <div className={styles.tierBase} />
                        </div>
                        <div className={styles.plate} />
                    </button>

                    {!blown && <p className={styles.blowHint}>Chạm vào bánh để thổi nến 💨</p>}
                </div>

                <AnimatePresence>
                    {blown && (
                        <motion.div
                            className={styles.messageCard}
                            initial={{ opacity: 0, y: 24, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.55, ease: 'easeOut' }}
                        >
                            <h2>Chúc {name} tuổi mới rực rỡ ✨</h2>
                            <p>{finalMessage}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}