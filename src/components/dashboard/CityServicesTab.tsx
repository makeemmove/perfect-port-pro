import { ArrowLeft, FileText, Droplets, Home, Ship, Car, FileSearch, Wrench, Flame, Zap, Ticket, ParkingCircle, Package } from 'lucide-react';

interface CityServicesTabProps {
  onBackToHome?: () => void;
}

const servicesPortalUrl =
  'https://www.invoicecloud.com/portal/(S(eprjuke3abvtshypdhrcwch0))/2/Site.aspx?G=6cc9b892-9ace-43a3-8da2-d7f90f0f32c5';

const CityServicesTab = ({ onBackToHome }: CityServicesTabProps) => {
  return (
    <div className="space-y-4 pb-8">
      {onBackToHome && (
        <button
          type="button"
          onClick={onBackToHome}
          className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>
      )}

      <h1 className="text-xl font-semibold tracking-tight">City Services</h1>
      <p className="text-sm text-muted-foreground">
        Quick links to pay city bills, report issues, and access utilities and parking.
      </p>

      <div className="space-y-5">
        {/* Bills */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
            Bills &amp; Certificates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={servicesPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Home className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Real Estate</div>
                <div className="text-sm font-medium">Real Estate Taxes</div>
              </div>
            </a>

            <a
              href={servicesPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Droplets className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Water</div>
                <div className="text-sm font-medium">Water Bill</div>
              </div>
            </a>

            <a
              href={servicesPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Property</div>
                <div className="text-sm font-medium">Personal Property Tax</div>
              </div>
            </a>

            <a
              href={servicesPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Ship className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Boating</div>
                <div className="text-sm font-medium">Boat Tax</div>
              </div>
            </a>

            <a
              href={servicesPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Car className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Vehicles</div>
                <div className="text-sm font-medium">Motor Vehicle Tax</div>
              </div>
            </a>

            <a
              href={servicesPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileSearch className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Certificates</div>
                <div className="text-sm font-medium">Municipal Lien Certificate</div>
              </div>
            </a>
          </div>
        </section>

        {/* Utilities & Reporting */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
            Utilities &amp; Reporting
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://www.frplowed.cc"
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Wrench className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Streets</div>
                <div className="text-sm font-medium">Report a pothole</div>
              </div>
            </a>

            <a
              href="https://libertyutilities.com/"
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Flame className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Gas</div>
                <div className="text-sm font-medium">Liberty Utilities</div>
              </div>
            </a>

            <a
              href="https://outagemap.ma.nationalgridus.com/?_gl=1*mv8ow8*_gcl_au*OTQzMjIyNTEwLjE3Njg5MjcxNTU.*_ga*OTg1NTQ4OTczLjE3NTk4NTEzMzA.*_ga_FH50R0D4B4*czE3NzMyNTg4NTUkbzUkZzEkdDE3NzMyNTg4OTYkajE5JGwwJGgw"
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Electric</div>
                <div className="text-sm font-medium">Power Outage Map</div>
              </div>
            </a>
          </div>
        </section>

        {/* Parking & Bulky Items */}
        <section className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
            Parking &amp; Bulky Items
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://fallriver.citationportal.com/"
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Ticket className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Parking</div>
                <div className="text-sm font-medium">Parking Ticket</div>
              </div>
            </a>

            <a
              href="https://unipaygold.unibank.com/transactioninfo.aspx?TID=28979"
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ParkingCircle className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Garage</div>
                <div className="text-sm font-medium">Parking Garage Portal</div>
              </div>
            </a>

            <a
              href="https://fallriverma.gov/departments/public_works/solid_waste/bulky_items.php"
              target="_blank"
              rel="noreferrer"
              className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Solid Waste</div>
                <div className="text-sm font-medium">Bulky Items</div>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CityServicesTab;

