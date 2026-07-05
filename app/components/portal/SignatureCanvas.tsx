import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

type Point = { x: number; y: number };

type Stroke = {
  points: Point[];
};

export type SignatureCanvasValue = {
  svg: string;
  width: number;
  height: number;
  strokeCount: number;
  pointCount: number;
};

export type SignatureCanvasHandle = {
  getValue: () => SignatureCanvasValue | null;
  clear: () => void;
};

type SignatureCanvasProps = {
  width?: number;
  height?: number;
  onChange?: (value: SignatureCanvasValue | null) => void;
  disabled?: boolean;
  className?: string;
};

const STROKE_COLOR = "#111827";
const STROKE_WIDTH = 2.5;
export const MIN_SIGNATURE_POINTS = 8;
export const MIN_SIGNATURE_PATH_LENGTH = 40;
export const MIN_SIGNATURE_BBOX = 24;

function buildSvg(strokes: Stroke[], width: number, height: number): string {
  const paths = strokes
    .map((stroke) => {
      if (stroke.points.length < 2) return "";
      const [first, ...rest] = stroke.points;
      const segments = rest.map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
      return `<path d="M ${first?.x.toFixed(1) ?? 0} ${first?.y.toFixed(1) ?? 0} ${segments}" fill="none" stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .filter(Boolean)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${paths}</svg>`;
}

export function computeSignatureCanvasMetrics(
  strokes: Stroke[],
  width: number,
  height: number,
): SignatureCanvasValue | null {
  const drawableStrokes = strokes.filter((stroke) => stroke.points.length >= 2);
  const pointCount = drawableStrokes.reduce((total, stroke) => total + stroke.points.length, 0);
  const strokeCount = drawableStrokes.length;

  let pathLength = 0;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const stroke of drawableStrokes) {
    for (let index = 1; index < stroke.points.length; index += 1) {
      const previous = stroke.points[index - 1];
      const current = stroke.points[index];
      if (!previous || !current) continue;
      pathLength += Math.hypot(current.x - previous.x, current.y - previous.y);
      minX = Math.min(minX, previous.x, current.x);
      minY = Math.min(minY, previous.y, current.y);
      maxX = Math.max(maxX, previous.x, current.x);
      maxY = Math.max(maxY, previous.y, current.y);
    }
  }

  const bboxWidth = Number.isFinite(minX) ? maxX - minX : 0;
  const bboxHeight = Number.isFinite(minY) ? maxY - minY : 0;

  if (strokeCount < 1 || pointCount < MIN_SIGNATURE_POINTS) {
    return null;
  }

  if (
    pathLength < MIN_SIGNATURE_PATH_LENGTH ||
    (bboxWidth < MIN_SIGNATURE_BBOX && bboxHeight < MIN_SIGNATURE_BBOX)
  ) {
    return null;
  }

  return {
    svg: buildSvg(drawableStrokes, width, height),
    width,
    height,
    strokeCount,
    pointCount,
  };
}

function getPoint(canvas: HTMLCanvasElement, event: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(function SignatureCanvas(
  {
    width = 320,
    height = 160,
    onChange,
    disabled = false,
    className = "",
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const getAllStrokes = useCallback((): Stroke[] => {
    return activeStrokeRef.current ? [...strokesRef.current, activeStrokeRef.current] : strokesRef.current;
  }, []);

  const getCurrentValue = useCallback((): SignatureCanvasValue | null => {
    return computeSignatureCanvasMetrics(getAllStrokes(), width, height);
  }, [getAllStrokes, height, width]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = STROKE_COLOR;
    context.lineWidth = STROKE_WIDTH;
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const stroke of getAllStrokes()) {
      if (stroke.points.length < 2) continue;
      context.beginPath();
      const [first, ...rest] = stroke.points;
      context.moveTo(first?.x ?? 0, first?.y ?? 0);
      for (const point of rest) {
        context.lineTo(point.x, point.y);
      }
      context.stroke();
    }
  }, [getAllStrokes]);

  const emitChange = useCallback(() => {
    onChange?.(getCurrentValue());
  }, [getCurrentValue, onChange]);

  useImperativeHandle(
    ref,
    () => ({
      getValue: getCurrentValue,
      clear: () => {
        strokesRef.current = [];
        activeStrokeRef.current = null;
        setStrokeCount(0);
        setIsDrawing(false);
        redraw();
        onChange?.(null);
      },
    }),
    [getCurrentValue, onChange, redraw],
  );

  useEffect(() => {
    redraw();
    emitChange();
  }, [emitChange, redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handlePointerDown(event: PointerEvent) {
      if (disabled || !canvas) return;
      canvas.setPointerCapture(event.pointerId);
      activeStrokeRef.current = { points: [getPoint(canvas, event)] };
      setIsDrawing(true);
      redraw();
    }

    function handlePointerMove(event: PointerEvent) {
      if (!activeStrokeRef.current || disabled || !canvas) return;
      activeStrokeRef.current.points.push(getPoint(canvas, event));
      redraw();
    }

    function finishStroke(event: PointerEvent) {
      if (!activeStrokeRef.current || disabled || !canvas) return;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      if (activeStrokeRef.current.points.length >= 2) {
        strokesRef.current = [...strokesRef.current, activeStrokeRef.current];
        setStrokeCount(strokesRef.current.length);
      }
      activeStrokeRef.current = null;
      setIsDrawing(false);
      redraw();
      emitChange();
    }

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", finishStroke);
    canvas.addEventListener("pointerleave", finishStroke);
    canvas.addEventListener("pointercancel", finishStroke);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", finishStroke);
      canvas.removeEventListener("pointerleave", finishStroke);
      canvas.removeEventListener("pointercancel", finishStroke);
    };
  }, [disabled, emitChange, redraw]);

  function clearCanvas() {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokeCount(0);
    setIsDrawing(false);
    redraw();
    onChange?.(null);
  }

  function undoStroke() {
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    redraw();
    emitChange();
  }

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block h-auto w-full touch-none"
          aria-label="Draw your signature"
          role="img"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn inline-flex border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
          onClick={clearCanvas}
          disabled={disabled || (strokeCount === 0 && !isDrawing)}
        >
          Clear
        </button>
        <button
          type="button"
          className="btn inline-flex border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
          onClick={undoStroke}
          disabled={disabled || strokeCount === 0}
        >
          Undo
        </button>
      </div>
    </div>
  );
});

export function isSignatureCanvasValueValid(value: SignatureCanvasValue | null): value is SignatureCanvasValue {
  if (!value?.svg?.trim()) return false;
  return (
    value.strokeCount >= 1 &&
    value.pointCount >= MIN_SIGNATURE_POINTS &&
    value.width > 0 &&
    value.height > 0
  );
}

export function describeSignatureCanvasValidation(value: SignatureCanvasValue | null): string | null {
  if (!value?.svg?.trim() || value.strokeCount < 1) {
    return "Please provide your signature.";
  }
  if (value.pointCount < MIN_SIGNATURE_POINTS) {
    return "Please provide your signature.";
  }
  return "Signature is too small. Please draw a larger signature.";
}
