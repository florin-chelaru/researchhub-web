import { css, StyleSheet } from "aphrodite";
import { ReactElement, ReactNode } from "react";
import colors from "~/config/themes/colors";
import { motion } from "framer-motion";
import { NullableString } from "~/config/types/root_types";

export type RhCarouselItemProps = {
  title?: ReactNode;
  body: ReactNode;
  direction?: string;
  onBodyClick?: Function;
};

export default function RhCarouselItem({
  title,
  body,
  direction,
  onBodyClick,
}: RhCarouselItemProps): ReactElement {
  const variants = {
    enter: (direction: string) => {
      return {
        x: direction === "right" ? -50 : 50,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => {
      return {
        zIndex: 0,
        x: direction === "right" ? 50 : -50,
        opacity: 0,
        top: 0,
      };
    },
  };

  return (
    <motion.div
      key={title}
      custom={direction}
      variants={variants}
      initial={"enter"}
      animate={"center"}
      exit={"exit"}
      transition={{ duration: 0.5 }}
      className={css(styles.rhCarouselItemRoot)}
    >
      <div className={css(styles.title)}>{title}</div>
      <div
        className={css(onBodyClick && DEFAULT_ITEM_STYLE.clickableBody)}
        onClick={() => (onBodyClick ? onBodyClick() : null)}
      >
        {body}
      </div>
    </motion.div>
  );
}

const styles = StyleSheet.create({
  title: {
    height: 32,
    display: "flex",
    alignItems: "flex-end",
  },
  rhCarouselItemRoot: {
    display: "flex",
    flexDirection: "column",
    minWidth: 248,
    width: "100%",
    position: "absolute",
  },
});

export const DEFAULT_ITEM_STYLE = StyleSheet.create({
  rhCarouselItemTitle: {
    alignItems: "center",
    display: "flex",
    fontSize: 16,
    fontWeight: 500,
    height: "100%",
    marginBottom: 10,
    textOverflow: "ellipsis",
    width: "100%",
  },
  emphasized: {
    fontWeight: 600,
  },
  emphasizedBlue: {
    // one-off gitcoin color
    color: "#00a37c",
    fontWeight: 600,
  },
  clickableBody: {
    cursor: "pointer",
  },
  rhCarouselItemBody: {
    display: "block",
    width: "100%",
    height: "100%",
    fontSize: 14,
    color: colors.BLACK(),
    lineHeight: "20px",
    textOverflow: "ellipsis",
  },
});
