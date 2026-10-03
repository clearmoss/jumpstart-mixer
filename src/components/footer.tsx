import gitHubLogo from "/github.svg";

import OutLink from "@/components/out-link.tsx";
import { Badge } from "@/components/ui/badge.tsx";

function Footer() {
  return (
    <footer className="mt-24 border-t pt-8 text-center text-sm text-muted-foreground">
      <p>
        Jumpstart Mixer is an unofficial project. Magic: The Gathering is a trademark of
        <OutLink href="https://company.wizards.com/"> Wizards of the Coast</OutLink>.
      </p>
      <div className="mt-6 flex justify-center">
        <OutLink href="https://github.com/clearmoss/jumpstart-mixer" className="flex items-center">
          <Badge variant="default" className="bg-white p-4 text-black outline">
            <img src={gitHubLogo} alt="GitHub" className="inline-block h-5 pr-2" />
            <span>View source on GitHub</span>
          </Badge>
        </OutLink>
      </div>
    </footer>
  );
}

export default Footer;
