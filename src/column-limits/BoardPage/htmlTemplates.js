import styles from './styles.css';
export const boardPageColumnHeaderBadge = ({ amountOfGroupTasks, groupLimit, isCloud = false }) => `
    <span class="${isCloud ? styles.limitColumnBadgeCloud : styles.limitColumnBadge}">
      ${amountOfGroupTasks}/${groupLimit}
      <span class="${isCloud ? styles.limitColumnBadgeCloud__hint : styles.limitColumnBadge__hint}">Issues per group / Max number of issues per group</span>
    </span>`;
