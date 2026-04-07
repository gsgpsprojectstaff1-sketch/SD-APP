import React from "react";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      animation: "fadeInConfirmDialog 0.2s"
    }}>
      <style>{`
        @keyframes fadeInConfirmDialog {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div style={{
        background: "#fff",
        borderRadius: 14,
        padding: "2.2rem 2.5rem 2rem 2.5rem",
        minWidth: 340,
        maxWidth: 380,
        boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        textAlign: "center",
        position: "relative",
        border: "1.5px solid #fbbf24"
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
          <AlertTriangle color="#fbbf24" size={38} style={{ marginBottom: 6 }} />
          {title && <h3 style={{margin: 0, color: '#b45309', fontWeight: 700, fontSize: 22}}>{title}</h3>}
        </div>
        <div style={{ color: '#444', fontSize: 16, marginBottom: 24 }}>{message}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 18 }}>
          <Button
            variant="destructive"
            onClick={onConfirm}
            style={{
              minWidth: 80,
              fontWeight: 600,
              fontSize: 16,
              background: '#ef4444',
              borderRadius: 8,
              boxShadow: '0 1px 4px rgba(239,68,68,0.08)',
              border: 'none',
              color: '#fff',
              transition: 'background 0.15s',
            }}
          >
            Yes
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            style={{
              minWidth: 80,
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              border: '1.5px solid #d1d5db',
              background: '#f9fafb',
              color: '#374151',
              transition: 'background 0.15s',
            }}
          >
            No
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
