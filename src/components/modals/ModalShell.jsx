import { styles } from "../../styles/theme.js";

export default function ModalShell({ children }) {
  return (
    <div className="modal-overlay-in" style={styles.modalOverlay}>
      <div className="modal-in" style={styles.modalCard}>{children}</div>
    </div>
  );
}
