function useIsMobile() {
    const isMobile = window.innerWidth < 768;
    return isMobile;
}

export default useIsMobile;
