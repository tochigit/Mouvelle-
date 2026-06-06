'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ruler, Shirt, Footprints } from 'lucide-react';

interface SizeGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const clothingSizes = [
  { size: 'XS', bustCm: '76-80', bustIn: '30-31.5', waistCm: '60-64', waistIn: '23.5-25', hipCm: '84-88', hipIn: '33-34.5' },
  { size: 'S', bustCm: '80-84', bustIn: '31.5-33', waistCm: '64-68', waistIn: '25-26.5', hipCm: '88-92', hipIn: '34.5-36' },
  { size: 'M', bustCm: '84-88', bustIn: '33-34.5', waistCm: '68-72', waistIn: '26.5-28', hipCm: '92-96', hipIn: '36-37.5' },
  { size: 'L', bustCm: '88-92', bustIn: '34.5-36', waistCm: '72-76', waistIn: '28-30', hipCm: '96-100', hipIn: '37.5-39' },
  { size: 'XL', bustCm: '92-96', bustIn: '36-38', waistCm: '76-80', waistIn: '30-31.5', hipCm: '100-104', hipIn: '39-41' },
  { size: 'XXL', bustCm: '96-100', bustIn: '38-39.5', waistCm: '80-84', waistIn: '31.5-33', hipCm: '104-108', hipIn: '41-42.5' },
];

const shoeSizes = [
  { size: '36', eu: '36', footCm: '22.5', footIn: '8.9', uk: '3.5', us: '5.5' },
  { size: '37', eu: '37', footCm: '23.0', footIn: '9.1', uk: '4', us: '6' },
  { size: '38', eu: '38', footCm: '23.5', footIn: '9.3', uk: '5', us: '7' },
  { size: '39', eu: '39', footCm: '24.5', footIn: '9.6', uk: '5.5', us: '7.5' },
  { size: '40', eu: '40', footCm: '25.0', footIn: '9.8', uk: '6.5', us: '8.5' },
  { size: '41', eu: '41', footCm: '25.5', footIn: '10.0', uk: '7', us: '9' },
  { size: '42', eu: '42', footCm: '26.0', footIn: '10.2', uk: '8', us: '10' },
  { size: '43', eu: '43', footCm: '26.5', footIn: '10.4', uk: '9', us: '10.5' },
  { size: '44', eu: '44', footCm: '27.0', footIn: '10.6', uk: '9.5', us: '11' },
  { size: '45', eu: '45', footCm: '27.5', footIn: '10.8', uk: '10', us: '11.5' },
];

export default function SizeGuideDialog({ open, onOpenChange }: SizeGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Size Guide</DialogTitle>
          <DialogDescription>
            Find your perfect fit with our comprehensive size chart and measurement guide.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="clothing" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0">
            <TabsTrigger
              value="clothing"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:shadow-none pb-3 gap-2"
            >
              <Shirt className="h-4 w-4" />
              Clothing
            </TabsTrigger>
            <TabsTrigger
              value="shoes"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] data-[state=active]:shadow-none pb-3 gap-2"
            >
              <Footprints className="h-4 w-4" />
              Shoes
            </TabsTrigger>
          </TabsList>

          {/* Clothing Tab */}
          <TabsContent value="clothing" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="h-4 w-4 text-[#D4AF37]" />
                <span>All measurements are in centimeters (cm) and inches (in)</span>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#D4AF37]/5 hover:bg-[#D4AF37]/5">
                      <TableHead className="font-semibold text-foreground">Size</TableHead>
                      <TableHead className="font-semibold text-foreground text-center" colSpan={2}>Bust</TableHead>
                      <TableHead className="font-semibold text-foreground text-center" colSpan={2}>Waist</TableHead>
                      <TableHead className="font-semibold text-foreground text-center" colSpan={2}>Hip</TableHead>
                    </TableRow>
                    <TableRow className="bg-[#D4AF37]/5 hover:bg-[#D4AF37]/5">
                      <TableHead />
                      <TableHead className="text-xs text-muted-foreground text-center">cm</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-center">in</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-center">cm</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-center">in</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-center">cm</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-center">in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clothingSizes.map((row) => (
                      <TableRow key={row.size}>
                        <TableCell className="font-semibold text-[#D4AF37]">{row.size}</TableCell>
                        <TableCell className="text-center">{row.bustCm}</TableCell>
                        <TableCell className="text-center">{row.bustIn}</TableCell>
                        <TableCell className="text-center">{row.waistCm}</TableCell>
                        <TableCell className="text-center">{row.waistIn}</TableCell>
                        <TableCell className="text-center">{row.hipCm}</TableCell>
                        <TableCell className="text-center">{row.hipIn}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Shoes Tab */}
          <TabsContent value="shoes" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="h-4 w-4 text-[#D4AF37]" />
                <span>All measurements are in centimeters (cm) and inches (in)</span>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#D4AF37]/5 hover:bg-[#D4AF37]/5">
                      <TableHead className="font-semibold text-foreground">EU</TableHead>
                      <TableHead className="font-semibold text-foreground text-center" colSpan={2}>Foot Length</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">UK</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">US</TableHead>
                    </TableRow>
                    <TableRow className="bg-[#D4AF37]/5 hover:bg-[#D4AF37]/5">
                      <TableHead />
                      <TableHead className="text-xs text-muted-foreground text-center">cm</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-center">in</TableHead>
                      <TableHead />
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shoeSizes.map((row) => (
                      <TableRow key={row.size}>
                        <TableCell className="font-semibold text-[#D4AF37]">{row.eu}</TableCell>
                        <TableCell className="text-center">{row.footCm}</TableCell>
                        <TableCell className="text-center">{row.footIn}</TableCell>
                        <TableCell className="text-center">{row.uk}</TableCell>
                        <TableCell className="text-center">{row.us}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* How to Measure Section */}
        <div className="mt-6 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5">
          <h3 className="font-serif text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-[#D4AF37]" />
            How to Measure
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p className="font-medium text-foreground">Bust</p>
              <p>Measure around the fullest part of your chest, keeping the measuring tape horizontal and snug but not tight.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Waist</p>
              <p>Measure around your natural waistline — the narrowest part of your torso, typically about an inch above your navel. Keep the tape comfortably loose.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Hip</p>
              <p>Stand with feet together and measure around the fullest part of your hips and buttocks, keeping the tape parallel to the floor.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Foot Length</p>
              <p>Stand on a piece of paper and trace the outline of your foot. Measure the distance from the heel to the longest toe. Measure both feet and use the larger measurement.</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#D4AF37]/20 text-xs text-muted-foreground">
            <p><span className="text-[#D4AF37] font-medium">Tip:</span> If your measurements fall between two sizes, we recommend choosing the larger size for a more comfortable fit.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
