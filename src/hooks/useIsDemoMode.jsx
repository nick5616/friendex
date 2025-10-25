function useIsDemoMode() {
    const location = useLocation();
    return location.pathname.startsWith("/demo");
}

export default useIsDemoMode;
