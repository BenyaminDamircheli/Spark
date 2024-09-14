import React from "react";
import styles from './Scrollbar.module.scss';


const Scrollbar = React.forwardRef(({ style, ...props }, ref) => {
    return <div style={{ ...style, overflow: 'overlay', overflowX: 'hidden' }} className={styles.scrollbar} ref={ref} {...props} />
  })
  

export default Scrollbar;
