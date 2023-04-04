import "@pages/popup/Popup.css";
import { usePopupBuilder } from "./constants";
// import MapChart from "./MapChart";

const Popup = () => {
  const {
    loading,
    pageDetails,
    holiday,
    currentWeather,
  } = usePopupBuilder();

  const displayLoading = () => (
    <div className="text-center">
      <div className="spinner-grow spinner-grow-sm text-success" id="loader" role="status">
      </div>
    </div>
  );

  return (
    <div className="container">
      <p className="h5">{pageDetails?.title}</p>
      <span className="badge bg-secondary sm-text">{pageDetails?.author}</span>
      <span className="xs-text">{pageDetails?.fewWords}</span>
      <div className="alert-primary sm-text alert-custom" role="alert">{pageDetails?.quote}
      </div>
      {loading && displayLoading()}
      {!loading && (
        <>
          <div>
            <div className="sm-text">
              <span>Feels like </span>
              <span className="badge bg-secondary">
                {currentWeather.current_temp}</span> F
            </div>
            <div className="d-flex justify-content-between sm-text">
              <div className="d-flex flex-row">
                <div className="badge bg-secondary">
                  <i className="bi bi-sunrise"></i>
                  <span>{currentWeather.current_day_sunrise}</span>
                </div>
                <span className="ms-1">
                  {currentWeather.current_rain >= 0 &&
                    <i className="bi bi-cloud-lightning-rain"></i>
                  }
                </span>
                {/* <MapChart /> */}
              </div>
              <div className="d-flex flex-row">
                <div className="badge bg-secondary">
                  <i className="bi bi-sunset"></i>
                  <span>{currentWeather.current_day_sunset}</span>
                </div>
              </div>
            </div>
          </div>
          <span className="badge bg-secondary">{holiday?.name}</span>
        </>
      )}
    </div>
  );
};

export default Popup;
