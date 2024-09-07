import CoinbaseButton from "@/components/CoinbaseButton";
import { useSessionKeys } from "@/context/SessionKeysContext";
import React, { useEffect, useRef } from "react";

const CurrencySwipeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { click } = useSessionKeys();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let notes: any[] = [];
        let bgObjects: any[] = [];
        let startY: number;
        const noteImage = new Image();
        const bgImage = new Image();

        noteImage.src =
            "https://png.pngtree.com/png-vector/20220529/ourmid/pngtree-vector-united-states-us-one-dollar-bill-money-invest-tender-vector-png-image_293643.jpg"; // Replace with your note image URL
        bgImage.src = "https://avatars.githubusercontent.com/u/108554348?v=4"; // Replace with your background object image URL

        const NOTE_WIDTH = 150;
        const NOTE_HEIGHT = 320;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight * 0.9;
        };

        const drawNote = (
            x: number,
            y: number,
            rotation: number,
            scale = 1
        ) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation + Math.PI / 2); // Add 90 degrees rotation
            ctx.scale(scale, scale);
            ctx.drawImage(
                noteImage,
                -NOTE_HEIGHT / 2,
                -NOTE_WIDTH / 2,
                NOTE_HEIGHT,
                NOTE_WIDTH
            );
            ctx.restore();
        };

        const drawBgObject = (x: number, y: number, size: number) => {
            ctx.drawImage(bgImage, x - size / 2, y - size / 2, size, size);
        };

        const update = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw background objects
            bgObjects.forEach((obj, index) => {
                obj.y += obj.speed;
                obj.x += obj.horizontalSpeed;
                drawBgObject(obj.x, obj.y, obj.size);
                if (obj.y > canvas.height + 50) {
                    bgObjects.splice(index, 1);
                }
            });

            // Add new background objects randomly
            if (Math.random() < 0.02) {
                addBgObject();
            }

            // Update and draw notes
            notes = notes.filter(
                (note) =>
                    note.y < canvas.height + NOTE_HEIGHT &&
                    note.x > -NOTE_WIDTH &&
                    note.x < canvas.width + NOTE_WIDTH
            );
            notes.forEach((note) => {
                // Apply gravity
                note.verticalSpeed += 0.2;
                note.y += note.verticalSpeed;
                note.x += note.horizontalSpeed;

                // Adjust scale based on height
                const maxHeight = canvas.height / 2;

                // Adjust scale based on height (reverse the scale effect)
                note.scale =
                    1 - (Math.min(note.y, maxHeight) / maxHeight) * 0.5;
                note.scale = Math.max(note.scale, 0.5);

                // note.scale =
                //     1 - (Math.min(note.y, maxHeight) / maxHeight) * 0.5;

                note.rotation += note.rotationSpeed;
                drawNote(note.x, note.y, note.rotation, note.scale);

                // Slow down horizontal speed
                note.horizontalSpeed *= 0.99;
            });

            drawNote(canvas.width / 2, canvas.height - NOTE_HEIGHT / 2, 0);

            requestAnimationFrame(update);
        };

        const addNote = async () => {
            console.log("Add Note");
            click();
            const angle = ((Math.random() - 0.5) * Math.PI) / 3; // -60 to 60 degrees
            const speed = Math.random() * 5 + 15;
            notes.push({
                x: canvas.width / 2,
                y: canvas.height - NOTE_HEIGHT / 2,
                verticalSpeed: -speed * Math.cos(angle),
                horizontalSpeed: speed * Math.sin(angle),
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                scale: 1,
            });
        };

        const addBgObject = () => {
            bgObjects.push({
                x: Math.random() * canvas.width,
                y: -50,
                size: Math.random() * 20 + 10,
                speed: Math.random() * 2 + 1,
                horizontalSpeed: (Math.random() - 0.5) * 2,
            });
        };

        const handleTouchStart = (e: TouchEvent) => {
            startY = e.touches[0].clientY;
        };

        const handleTouchEnd = async (e: TouchEvent) => {
            const endY = e.changedTouches[0].clientY;
            if (startY - endY > 50) {
                await addNote();
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            startY = e.clientY;
        };

        const handleMouseUp = async (e: MouseEvent) => {
            if (startY - e.clientY > 50) {
                await addNote();
            }
        };

        window.addEventListener("resize", resizeCanvas);
        canvas.addEventListener("touchstart", handleTouchStart);
        canvas.addEventListener("touchend", handleTouchEnd);
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mouseup", handleMouseUp);

        // Start the game once the image is loaded
        noteImage.onload = () => {
            resizeCanvas();
            update();
        };

        // Clean up event listeners on component unmount
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            canvas.removeEventListener("touchstart", handleTouchStart);
            canvas.removeEventListener("touchend", handleTouchEnd);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div className="flex items-center space-y-4 flex-col">
            <canvas ref={canvasRef} />
            <div>
                <CoinbaseButton />
            </div>
        </div>
    );
};

export default CurrencySwipeGame;
