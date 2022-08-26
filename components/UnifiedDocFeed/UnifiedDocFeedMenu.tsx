import { css, StyleSheet } from "aphrodite";
import { breakpoints } from "~/config/themes/screen";
import { useState, useEffect, useMemo, useRef } from "react";
import colors, { pillNavColors, iconColors } from "~/config/themes/colors";
import FeedOrderingDropdown from "./FeedOrderingDropdown";
import { feedTypeOpts, topLevelFilters } from "./constants/UnifiedDocFilters";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import { getSelectedUrlFilters } from "./utils/getSelectedUrlFilters";
import handleFilterSelect from "./utils/handleFilterSelect";
import FeedTab from "./FeedTab";
import icons from "~/config/themes/icons";
import TopLevelFilters from "./TopLevelFilters";

type Args = {
  hubState?: any,
}

const UnifiedDocFeedMenu = ({ hubState }: Args) => {
  const router = useRouter();
  const hubsDownRef = useRef(null);
  const tabsContainerRef = useRef<HTMLInputElement | null>(null);

  const [isSmallScreenDropdownOpen, setIsSmallScreenDropdownOpen] =
    useState(false);
  const [showMobileLeftScroll, setShowMobileLeftScroll] =
    useState(false);
  const [showMobileRightScroll, setShowMobileRightScroll] =
    useState(false);
  const [showMobileScrollNav, setShowMobileScrollNav] =
    useState(false);    

  const [tagsMenuOpenFor, setTagsMenuOpenFor] = useState(null);
  const selectedFilters = useMemo(() => {
    return getSelectedUrlFilters({
      query: router.query,
      pathname: router.pathname,
    });
  }, [router.pathname, router.query]);

  useEffect(() => {
    const _handleOutsideClick = (e) => {
      const isTypeFilterClicked = e.target.closest(".typeFilter");
      if (!isTypeFilterClicked) {
        setTagsMenuOpenFor(null);
      }

      
      // if ((hubsDownRef.current.contains(e.target) && isHubSelectOpen) || !hubsDownRef.current.contains(e.target)) {
      //   setIsHubSelectOpen(false);
      // }
    };

    document.addEventListener("click", _handleOutsideClick);
    
    return () => {
      document.removeEventListener("click", _handleOutsideClick);
    };
  }, []);
  
  useEffect(() => {    
    const _handleScroll = (event) => {
      const showMobileRightScroll = (event.currentTarget.scrollWidth - event.currentTarget.scrollLeft) !== event.currentTarget.offsetWidth;
      const showMobileLeftScroll = event.currentTarget.scrollLeft > 0;
      
      setShowMobileLeftScroll(showMobileLeftScroll);
      setShowMobileRightScroll(showMobileRightScroll);
    }
    
    if (tabsContainerRef?.current) {
      const hasHorizontalScroll = tabsContainerRef.current.clientWidth < tabsContainerRef.current.scrollWidth
      
      if (hasHorizontalScroll) {
        setShowMobileScrollNav(hasHorizontalScroll);
        setShowMobileRightScroll(true);
      }

      tabsContainerRef.current.addEventListener("scroll", _handleScroll);
    }

    return () => {
      if (tabsContainerRef?.current) {
        tabsContainerRef.current.removeEventListener("scroll", _handleScroll);
      }
    }
  }, [tabsContainerRef])
  
  const _getTabs = ({ selectedFilters }) => {
    const _renderOption = (opt) => {
      return (
        <div className={css(styles.labelContainer)}>
          <span className={css(styles.iconWrapper)}>{opt.icon}</span>
          <span>{opt.label}</span>
        </div>
      );
    };

    const tabs = Object.values(feedTypeOpts).map((opt) => ({
      html: _renderOption(opt),
      ...opt,
    }));

    let tabsAsHTML = tabs.map((tabObj) => {
      if (tabObj.value === selectedFilters.type) {
        // @ts-ignore
        tabObj.isSelected = true;
      }
      return tabObj;
    });

    return tabsAsHTML;
  };

  // const _getSelectedTab = (tabs) => {
  //   let selectedTab = null;
  //   for (let i = 0; i < tabs.length; i++) {
  //     if (tabs[i].isSelected) {
  //       selectedTab = tabs[i];
  //       break;
  //     }
  //   }

  //   if (!selectedTab) {
  //     console.error("Selected tab not found. This should not happen.");
  //     selectedTab = tabs[0];
  //   }

  //   return selectedTab;
  // };

  const tabs = _getTabs({ selectedFilters });
  // const selectedTab = _getSelectedTab(tabs);

  const tabElems = useMemo(
    () =>
      tabs.map((t) => (
        <FeedTab
          selectedFilters={selectedFilters}
          tabObj={t}
          router={router}
          handleOpenTagsMenu={(forType) => setTagsMenuOpenFor(forType)}
          handleFilterSelect={(selected) =>
            handleFilterSelect({ router, ...selected })
          }
          isTagsMenuOpen={tagsMenuOpenFor === t.value}
        />
      )),
    [tagsMenuOpenFor, selectedFilters]
  );

  return (
    <div className={css(styles.filtersContainer)}>
      <div className={css(styles.buttonGroup)}>
        <div className={css(styles.mainFilters)}>
          <TopLevelFilters selectedFilters={selectedFilters} hubState={hubState} />
          <div className={css(styles.feedMenu)}>
            <div className={css(styles.filtersAsTabs)}>
              {/* <div className={css(styles.tab, styles.smallScreenFilters)}>
                <DropdownButton
                  labelAsHtml={
                    <div className={css(styles.labelContainer)}>
                      <span className={css(styles.iconWrapper)}>
                        {selectedTab.icon}
                      </span>
                      <span className={css(styles.tabText)}>
                        {selectedTab?.selectedLabel || selectedTab.label}
                      </span>
                    </div>
                  }
                  selected={selectedTab.value}
                  isOpen={isSmallScreenDropdownOpen}
                  opts={tabs}
                  onClick={() => setIsSmallScreenDropdownOpen(true)}
                  dropdownClassName="combinedDropdown"
                  onClickOutside={() => {
                    setIsSmallScreenDropdownOpen(false);
                  }}
                  overridePopoverStyle={styles.overridePopoverStyle}
                  positions={["bottom", "right"]}
                  customButtonClassName={[styles.smallScreenFiltersDropdown]}
                  overrideOptionsStyle={styles.moreDropdownOptions}
                  overrideDownIconStyle={styles.downIcon}
                  onSelect={(selected) => {
                    const tabObj = tabs.find((t) => t.value === selected);
                    handleFilterSelect({ router, typeFilter: tabObj.value });
                  }}
                  onClose={() => setIsSmallScreenDropdownOpen(false)}
                />
              </div> */}

              <div className={css(styles.typeFiltersContainer)} >
                <div className={css(styles.mobileScrollNav, !showMobileScrollNav && styles.hideMobileScroll)}>
                  <span className={css(styles.mobileScrollBtn, styles.mobileLeftScroll, !showMobileLeftScroll && styles.hideMobileScroll)} onClick={() =>
                    // @ts-ignore
                    tabsContainerRef.current.scrollBy({left: -60, behavior: 'smooth' }) 
                  }>{icons.chevronLeft}</span>
                  <span className={css(styles.mobileScrollBtn, styles.mobileRightScroll, !showMobileRightScroll && styles.hideMobileScroll)} onClick={() => {
                    console.log('here')
                    // @ts-ignore
                    tabsContainerRef.current.scrollBy({left: 60, behavior: 'smooth' }) 
                  }}>{icons.chevronRight}</span>
                </div>
                <div className={css(styles.tabsContainer)} ref={tabsContainerRef}>
                  {tabElems}
                </div>
              </div>

              <div className={css(styles.orderingContainer)}>
                <FeedOrderingDropdown
                  selectedFilters={selectedFilters}
                  selectedOrderingValue={selectedFilters.sort}
                  selectedScopeValue={selectedFilters.time}
                  onOrderingSelect={(selected) =>
                    handleFilterSelect({ router, sort: selected.value })
                  }
                  onScopeSelect={(selected) =>
                    handleFilterSelect({ router, timeScope: selected.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  feedMenu: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  labelContainer: {
    display: "flex",
    height: "100%",
  },
  iconWrapper: {
    marginRight: 7,
    fontSize: 16,
    [`@media only screen and (max-width: 1350px)`]: {
      fontSize: 14,
      display: "none",
    },
    [`@media only screen and (max-width: 1200px)`]: {
      display: "block",
    },
  },
  filtersAsTabs: {
    width: "100%",
    display: "flex",
  },
  smallScreenFilters: {
    display: "none",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      display: "block",
    },
  },
  typeFiltersContainer: {
    width: "100%",
    position: "relative",
    // [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      //   display: "none",
      // },
    },
    
    tabsContainer: {
      boxSizing: "border-box",
      overflowX: "scroll",
      overflowScrolling: "touch",
      display: "flex",
      scrollbarWidth: "none",
      "::-webkit-scrollbar": {
        display: "none",
      }
  },
  mobileScrollNav: {

  },
  mobileScrollBtn: {
    position: "absolute",
    // background: "white",    
    zIndex: 2,
  },
  hideMobileScroll: {
    display: "none",
  },
  mobileLeftScroll: {
    left: 0,
    padding: "5px 30px 5px 10px",
    background: "linear-gradient(270deg, rgba(255, 255, 255, 0) 0px, rgb(255, 255, 255) 50%)",
  },
  
  mobileRightScroll: {
    right: 0,
    padding: "5px 10px 5px 30px",
    background: "linear-gradient(90deg, rgba(255, 255, 255, 0) 0px, rgb(255, 255, 255) 50%)"
  },  

  orderingContainer: {
    display: "none",
    marginLeft: "auto",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      marginLeft: 10,
      alignSelf: "center",
      fontSize: 15,
    },
  },
  smallScreenFiltersDropdown: {
    padding: "8px 16px",
    display: "flex",
    borderRadius: 40,
    color: pillNavColors.primary.filledTextColor,
    backgroundColor: pillNavColors.primary.filledBackgroundColor,
    ":hover": {
      borderRadius: 40,
      backgroundColor: pillNavColors.primary.filledBackgroundColor,
    },
  },
  overridePopoverStyle: {
    width: "220px",
  },
  buttonGroup: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
    marginBottom: 10,
    overflow: "visible",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      flexDirection: "column-reverse",
    },
  },
  mainFilters: {
    height: "inherit",
    width: "100%",
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      borderBottom: `unset`,
    },
  },
  filtersContainer: {
    marginBottom: 15,
    [`@media only screen and (max-width: ${breakpoints.small.str})`]: {
      // marginBottom: 10,
    },
  },
});

const mapStateToProps = (state) => ({
  hubState: state.hubs,
});

export default connect(mapStateToProps, null)(UnifiedDocFeedMenu);
