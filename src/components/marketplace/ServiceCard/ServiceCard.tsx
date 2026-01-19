import { MarketplaceService } from "@/types/marketplace.types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const ServiceCard = ({ service }: { service: MarketplaceService }) => {
  return (
    <Link 
      href={`/marketplace/services/${service._id}`}
      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] flex flex-col hover:border-pink-500/50 transition-all duration-300"
    >
      <div className="grow space-y-4">
        <div className="flex justify-between items-start">
          <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🎨
          </div>
          {service.featured && (
            <span className="bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
              Featured
            </span>
          )}
        </div>

        <div>
          <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">
            {service.category}
          </span>
          <h3 className="text-xl font-black mt-1 leading-tight group-hover:text-pink-600 transition-colors">
            {service.title}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 line-clamp-2">
            {service.description}
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
           <span className="text-[10px] text-zinc-400 uppercase font-bold block">From</span>
           <span className="text-2xl font-black">${service.price}</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all">
        <ArrowRight size={24} />
      </div>
      </div>
    </Link>
  );
};